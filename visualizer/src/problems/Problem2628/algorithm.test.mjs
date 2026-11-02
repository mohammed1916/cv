import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, code, parseInput, python } from './algorithm.js'

const solve = (o1, o2) => buildTrace({ o1, o2 }).result

test('2628 worked examples', () => {
  assert.equal(solve({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 }), true)
  assert.equal(solve([1, 2], [2, 1]), false)
  assert.equal(solve(null, {}), false)
  assert.equal(solve({ a: null }, { a: {} }), false)
  assert.equal(solve([1, { x: true }], [1, { x: 1 }]), false)
})

test('2628 edge cases: arrays versus objects, null, and empty containers', () => {
  assert.equal(solve([], {}), false)
  assert.equal(solve({}, {}), true)
  assert.equal(solve([], []), true)
  assert.equal(solve(0, false), false)
  assert.equal(solve(null, null), true)
  assert.equal(solve('1', 1), false)
  assert.equal(solve({ a: 1 }, { a: 1, b: 2 }), false)
  assert.equal(solve({ a: 1, b: 2 }, { a: 1, c: 2 }), false)
})

test('2628 input caps and types are enforced', () => {
  assert.throws(() => parseInput('{"o1":1}'))
  assert.throws(() => parseInput('{"o1":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],"o2":1}'))
  assert.throws(() => parseInput('{"o1":[[[[[1]]]]],"o2":1}'))
  assert.deepEqual(parseInput('{"o1":{"a":[1]},"o2":null}'), { o1: { a: [1] }, o2: null })
})

// Independent oracle: canonical text with object keys sorted at every level and arrays kept in order.
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  const keys = Object.keys(value).sort()
  return `{${keys.map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
}

test('2628 random JSON values match a canonical-text oracle', () => {
  let seed = 2628
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const make = depth => {
    const kind = depth >= 2 ? rnd(4) : rnd(6)
    if (kind === 0) return rnd(3)
    if (kind === 1) return ['a', 'b'][rnd(2)]
    if (kind === 2) return [null, true, false][rnd(3)]
    if (kind === 3) return rnd(2) ? [0, 1][rnd(2)] : 'x'
    if (kind === 4) return Array.from({ length: rnd(3) }, () => make(depth + 1))
    const obj = {}
    for (let i = 0, n = rnd(3); i < n; i++) obj[['p', 'q', 'r'][rnd(3)]] = make(depth + 1)
    return obj
  }
  const reorder = value => {
    if (value === null || typeof value !== 'object') return value
    if (Array.isArray(value)) return value.map(reorder)
    const out = {}
    for (const key of Object.keys(value).reverse()) out[key] = reorder(value[key])
    return out
  }
  for (let t = 0; t < 400; t++) {
    const o1 = make(0)
    const o2 = rnd(2) ? reorder(o1) : make(0)
    assert.equal(solve(o1, o2), canonical(o1) === canonical(o2), JSON.stringify({ o1, o2 }))
  }
})

test('2628 frame invariants: every line is real and the trace ends with the answer', () => {
  const pythonLines = python.split('\n').length
  const run = buildTrace({ o1: { a: [1, 2] }, o2: { a: [1, 3] } })
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pythonLines)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.view)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.result, false)
})
