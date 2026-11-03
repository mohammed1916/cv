import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

// Independent oracle: sort, then pair the smallest with the largest while the sum allows it.
function oracle(nums, k) {
  const sorted = [...nums].sort((a, b) => a - b)
  let l = 0, r = sorted.length - 1, pairs = 0
  while (l < r) {
    const sum = sorted[l] + sorted[r]
    if (sum === k) { pairs += 1; l += 1; r -= 1 }
    else if (sum < k) l += 1
    else r -= 1
  }
  return pairs
}

test('1679 mixed, repeated and no-partner samples', () => {
  assert.equal(solve([1, 1, 2, 4, 5, 7], 8), 1)
  assert.equal(solve([3, 1, 3, 1, 3, 1], 4), 3)
  assert.equal(solve([2, 2, 9], 5), 0)
})

test('1679 a value pairs only with a distinct waiting partner when it equals half of k', () => {
  assert.equal(solve([4], 8), 0)
  assert.equal(solve([4, 4], 8), 1)
})

test('1679 random inputs match the sorted two-pointer oracle', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(12))
    const k = 2 + rnd(20)
    const input = JSON.stringify({ nums, k })
    parseInput(input)
    assert.equal(solve(nums, k), oracle(nums, k), input)
  }
})

test('1679 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":3}'), /nums/)
  assert.throws(() => parseInput('{"nums":[1,2],"k":1}'), /k is/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

test('1679 every frame has a phase and a code line inside the solver', () => {
  const run = buildTrace({ nums: [1, 1, 2, 4, 5, 7], k: 8 })
  for (const frame of run.frames) {
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 10)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 11)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
