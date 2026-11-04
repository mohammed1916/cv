import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, PREDICATES, code, python } from './algorithm.js'

const solve = (obj, fn) => buildTrace({ obj, fn }).result

test('2823 hand-computed cases', () => {
  assert.deepEqual(solve({ id: 7, tags: ['new', 'old', 3], meta: { size: -2, owner: { age: -1 } } }, 'positive'), { id: 7, tags: [3] })
  assert.deepEqual(solve([1, [4, -4, [8]], 'x', [3], { a: 6, b: 5 }], 'even'), [[4, -4, [8]], { a: 6 }])
  assert.equal(solve([[], { x: [null] }, 'hi'], 'number'), undefined)
  assert.equal(solve([], 'truthy'), undefined)
  assert.equal(solve({}, 'truthy'), undefined)
  assert.deepEqual(solve({ gone: 0, here: null }, 'null'), { here: null })
})

test('2823 containers are never passed to fn', () => {
  assert.equal(solve([[1], { a: [2] }], 'isArray'), undefined)
})

test('2823 a __proto__ key stays ordinary data', () => {
  const { obj, fn } = parseInput('{"obj":{"__proto__":{"a":5},"b":-1},"fn":"positive"}')
  const out = solve(obj, fn)
  assert.equal(JSON.stringify(out), '{"__proto__":{"a":5}}')
  assert.equal(Object.getPrototypeOf(out), Object.prototype)
})

test('2823 parseInput rejects bad input and never evaluates code', () => {
  assert.throws(() => parseInput('{"obj":5,"fn":"positive"}'))
  assert.throws(() => parseInput('{"obj":null,"fn":"positive"}'))
  assert.throws(() => parseInput('{"obj":[1],"fn":"x => x > 0"}'))
  assert.throws(() => parseInput('{"obj":[1],"fn":"constructor"}'))
  assert.throws(() => parseInput(`{"obj":[${new Array(70).fill(1).join(',')}],"fn":"truthy"}`))
})

// Oracle: a bottom-up rewrite that shares no code with the trace.
function oracle(data, test) {
  if (Array.isArray(data)) {
    const parts = data.map(item => oracle(item, test)).filter(item => item !== undefined)
    return parts.length ? parts : undefined
  }
  if (data && typeof data === 'object') {
    const pairs = Object.entries(data).map(([k, v]) => [k, oracle(v, test)]).filter(([, v]) => v !== undefined)
    return pairs.length ? Object.fromEntries(pairs) : undefined
  }
  return test(data) ? data : undefined
}
const hasEmpty = v => v && typeof v === 'object' && (Object.keys(v).length === 0 || Object.values(v).some(hasEmpty))

test('2823 random inputs match the oracle and leave no empty containers', () => {
  let seed = 2823
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const value = depth => {
    const pick = rnd(depth > 3 ? 5 : 7)
    if (pick === 0) return rnd(9) - 4
    if (pick === 1) return ['a', '', 'b'][rnd(3)]
    if (pick === 2) return null
    if (pick === 3) return rnd(2) === 0
    if (pick === 4) return rnd(5) + 1
    const size = rnd(4)
    if (pick === 5) return Array.from({ length: size }, () => value(depth + 1))
    return Object.fromEntries(Array.from({ length: size }, (_, i) => [`k${i}`, value(depth + 1)]))
  }
  const names = Object.keys(PREDICATES)
  for (let round = 0; round < 800; round++) {
    const obj = rnd(2) ? [value(1), value(1), value(1)] : { p: value(1), q: value(1) }
    const fn = names[rnd(names.length)]
    const out = buildTrace({ obj, fn })
    assert.deepEqual(out.result, oracle(obj, PREDICATES[fn].test), JSON.stringify({ obj, fn }))
    assert.ok(!hasEmpty(out.result))
    assert.deepEqual(out.input.obj, obj)
  }
})

test('2823 frames map to real lines and the result tree matches the answer', () => {
  const lines = python.split('\n')
  const { frames, result } = buildTrace({ obj: { id: 7, tags: ['new', 'old', 3], meta: { size: -2, owner: { age: -1 } } }, fn: 'positive' })
  assert.equal(frames[0].phase, 'start')
  assert.equal(frames.at(-1).phase, 'done')
  assert.equal(frames.at(-1).output, JSON.stringify(result))
  for (const frame of frames) {
    assert.ok(code[frame.activeLine - 1])
    assert.ok(lines[frame.pythonLine - 1]?.trim())
    assert.ok(frame.message)
  }
  const test_ = frames.find(f => f.phase === 'test')
  assert.ok(lines[test_.pythonLine - 1].includes('fn(data)'))
  const flat = n => [n.value, ...n.children.flatMap(flat)]
  assert.deepEqual(flat(frames.at(-1).built), ['root: { }', '"id": 7', '"tags": [ ]', '[0]: 3'])
  assert.equal(buildTrace({ obj: [-1], fn: 'positive' }).frames.at(-1).built, null)
  assert.equal(buildTrace({ obj: [-1], fn: 'positive' }).frames.at(-1).output, 'undefined')
})
