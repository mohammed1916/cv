import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, resolveCalls, tools, code, python, phases } from './algorithm.js'

const run = input => buildTrace(parseInput(JSON.stringify(input)))
const counts = input => run(input).result.map(entry => entry.calls)

test('2630 hand-computed: argument order and length make different keys', () => {
  const { result } = run({ fn: 'add', calls: [[3, 4], [4, 3], [3, 4], [3], [3, 4, 0]] })
  assert.deepEqual(result, [
    { val: 7, calls: 1 }, { val: 7, calls: 2 }, { val: 7, calls: 2 }, { val: 3, calls: 3 }, { val: 7, calls: 4 },
  ])
})

test('2630 hand-computed: shared objects hit, new literals miss', () => {
  const { result } = run({
    fn: 'merge', objects: { cart: { apples: 2 } },
    calls: [['@cart', { pears: 1 }], ['@cart', { pears: 1 }], ['@cart', '@cart'], ['@cart', '@cart']],
  })
  assert.deepEqual(result.map(entry => entry.calls), [1, 2, 3, 3])
  assert.deepEqual(result[0].val, { apples: 2, pears: 1 })
  assert.deepEqual(result[3].val, { apples: 2 })
})

test('2630 hit returns the very object stored by the first run', () => {
  const { result } = run({ fn: 'merge', objects: { o: {} }, calls: [['@o'], ['@o']] })
  assert.equal(result[0].val, result[1].val)
})

test('2630 zero arguments and number vs string', () => {
  const { result } = run({ fn: 'list', calls: [[], [], [1], ['1'], [1]] })
  assert.deepEqual(result.map(entry => entry.calls), [1, 1, 2, 3, 3])
  assert.deepEqual(result[3].val, ['1'])
})

test('2630 null and false are distinct keys', () => {
  assert.deepEqual(counts({ fn: 'list', calls: [[null], [false], [0], [''], [null]] }), [1, 2, 3, 4, 4])
})

test('2630 parseInput rejects bad input', () => {
  assert.throws(() => parseInput('{"fn":"sub","calls":[[1]]}'))
  assert.throws(() => parseInput('{"fn":"add","calls":[]}'))
  assert.throws(() => parseInput('{"fn":"add","calls":[["x"]]}'))
  assert.throws(() => parseInput('{"fn":"merge","calls":[[1]]}'))
  assert.throws(() => parseInput('{"fn":"merge","calls":[["@nope"]]}'))
  assert.throws(() => parseInput('[1]'))
  assert.throws(() => parseInput('{"fn":"list","calls":[[1,2,3,4,5]]}'))
})

// Oracle: remembers every earlier argument list and compares element by element with ===.
function oracle(input) {
  const seen = []
  let fnCalls = 0
  return resolveCalls(input).map(call => {
    const args = call.map(arg => arg.value)
    let entry = seen.find(old => old.args.length === args.length && old.args.every((value, i) => value === args[i]))
    if (!entry) {
      fnCalls += 1
      entry = { args, val: tools[input.fn](...args) }
      seen.push(entry)
    }
    return { val: entry.val, calls: fnCalls }
  })
}

test('2630 agrees with a linear === scan on random call lists', () => {
  let seed = 2630
  const rand = limit => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % limit }
  const pool = [1, 2, '1', true, null, '@a', '@b', {}, { z: 1 }, []]
  for (let t = 0; t < 400; t++) {
    const calls = Array.from({ length: 1 + rand(14) }, () => Array.from({ length: rand(5) }, () => pool[rand(pool.length)]))
    const input = { fn: 'list', objects: { a: { k: 1 }, b: { k: 1 } }, calls }
    assert.deepEqual(run(input).result, oracle(input))
  }
})

test('2630 frames are well formed', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const lines = python.split('\n')
  for (const input of [
    { fn: 'add', calls: [[3, 4], [4, 3], [3, 4], [3], [3, 4, 0]] },
    { fn: 'merge', objects: { cart: { apples: 2 } }, calls: [['@cart', { pears: 1 }], ['@cart', { pears: 1 }], ['@cart', '@cart'], ['@cart', '@cart']] },
    { fn: 'list', calls: [[], [], [1], ['1'], [1]] },
  ]) {
    const { frames } = run(input)
    assert.ok(frames.length > 0)
    for (const frame of frames) {
      assert.ok(ids.has(frame.phase), frame.phase)
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      const line = lines[frame.pythonLine - 1]
      assert.ok(line.trim() && !line.trim().startsWith('def ') && !line.trim().startsWith('#'), line)
      assert.ok(frame.message.length > 0)
      assert.ok(frame.path.every(id => id === 0 || id < 40))
    }
    assert.equal(frames.at(-1).phase, 'done')
  }
})

test('2630 frames flag a look-alike object and never run fn on a hit', () => {
  const { frames } = run({ fn: 'merge', objects: { cart: { apples: 2 } }, calls: [['@cart', { pears: 1 }], ['@cart', { pears: 1 }], ['@cart'], ['@cart']] })
  assert.ok(frames.some(frame => frame.lookalike))
  frames.filter(frame => frame.phase === 'hit').forEach(frame => {
    const before = frames[frames.indexOf(frame) - 1]
    assert.equal(frame.fnCalls, before.fnCalls)
  })
  assert.equal(frames.filter(frame => frame.phase === 'miss').length, frames.at(-1).fnCalls)
})
