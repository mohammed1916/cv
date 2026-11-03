import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr, k) => buildTrace(parseInput(JSON.stringify({ arr, k }))).result

test('1539 sample inputs give the expected positives', () => {
  assert.equal(solve([2, 3, 4, 7, 11], 5), 9)
  assert.equal(solve([5, 6, 7], 2), 2)
  assert.equal(solve([1, 2, 3], 3), 6)
})

test('1539 frames end on the done phase and the trace is well formed', () => {
  const trace = buildTrace({ arr: [2, 3, 4, 7, 11], k: 5 })
  assert.equal(trace.frames[0].phase, 'start')
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) assert.ok(frame.activeLine > 0 && typeof frame.message === 'string')
})

test('1539 rejects malformed input', () => {
  assert.throws(() => parseInput('{"arr":[3,2],"k":1}'), /increasing/)
  assert.throws(() => parseInput('{"arr":[1,2],"k":0}'), /k/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

// Brute-force oracle: enumerate positive integers that are not in arr.
test('1539 random arrays match a brute-force oracle', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(8)
    const set = new Set()
    while (set.size < len) set.add(1 + rnd(30))
    const arr = [...set].sort((a, b) => a - b)
    const k = 1 + rnd(12)
    let count = 0
    let candidate = 0
    while (count < k) {
      candidate++
      if (!arr.includes(candidate)) count++
    }
    assert.equal(solve(arr, k), candidate, JSON.stringify({ arr, k }))
  }
})
