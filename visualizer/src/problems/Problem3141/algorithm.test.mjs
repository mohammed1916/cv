import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, m) => buildTrace({ nums, m }).result

test('3141 worked values', () => {
  assert.deepEqual(solve([1, 2, 3], 2), [2, 2, 1])
  assert.deepEqual(solve([0, 3], 2), [2, 2])
  assert.deepEqual(solve([5], 3), [0])
})

// Oracle: popcount of the XOR over every ordered pair, written without the trace helper.
function oracle(nums, m) {
  return nums.map(a => {
    let best = 0
    for (const b of nums) {
      let x = (a ^ b) & ((1 << m) - 1)
      let count = 0
      while (x) { count += x & 1; x >>= 1 }
      best = Math.max(best, count)
    }
    return best
  })
}

test('3141 random arrays match a popcount oracle', () => {
  let seed = 3141
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 300; trial++) {
    const m = 1 + rnd(6)
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(2 ** m))
    assert.deepEqual(solve(nums, m), oracle(nums, m), JSON.stringify({ nums, m }))
  }
})

test('3141 each answer is between 0 and m', () => {
  const run = buildTrace({ nums: [2, 5, 9, 12], m: 4 })
  for (const value of run.result) assert.ok(value >= 0 && value <= 4)
})

test('3141 frames carry real pseudocode and python lines and the answer so far', () => {
  const run = buildTrace({ nums: [2, 5, 9, 12], m: 4 })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 10, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 13, `pythonLine ${frame.pythonLine}`)
    assert.equal(frame.answer.length, 4)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('3141 parse rejects values outside m bits', () => {
  assert.throws(() => parseInput('{"nums":[8],"m":3}'))
  assert.throws(() => parseInput('{"nums":[1],"m":0}'))
  assert.throws(() => parseInput('{"nums":[],"m":2}'))
  assert.deepEqual(parseInput('{"nums":[1,2],"m":2}'), { nums: [1, 2], m: 2 })
})
