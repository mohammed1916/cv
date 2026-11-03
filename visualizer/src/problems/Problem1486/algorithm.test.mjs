import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: materialise the array, then XOR it.
function oracle(n, start) {
  const nums = Array.from({ length: n }, (_, i) => start + 2 * i)
  return nums.reduce((a, b) => a ^ b, 0)
}

test('hand-checked small case: 3, 5, 7, 9 XOR to 8', () => {
  assert.equal(buildTrace({ n: 4, start: 3 }).result, 8)
  assert.equal(buildTrace({ n: 1, start: 7 }).result, 7)
})

test('every permitted n and start pair in a grid agrees with the oracle', () => {
  for (let n = 1; n <= 60; n += 1) {
    for (let start = 0; start <= 1000; start += 37) {
      assert.equal(buildTrace({ n, start }).result, oracle(n, start), `n=${n} start=${start}`)
    }
  }
})

test('frames show one accumulate step per position and end with done', () => {
  const run = buildTrace({ n: 5, start: 2 })
  assert.equal(run.frames.filter(f => f.phase === 'accumulate').length, 5)
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).result, run.result)
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 6)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[1,2]'), /JSON object|object/)
  assert.throws(() => parseInput('{"n":0,"start":1}'), /1 to 60/)
  assert.throws(() => parseInput('{"n":61,"start":1}'), /1 to 60/)
  assert.throws(() => parseInput('{"n":3,"start":1001}'), /0 to 1000/)
  assert.throws(() => parseInput('{"n":3.5,"start":1}'), /integers|n and start/)
})
