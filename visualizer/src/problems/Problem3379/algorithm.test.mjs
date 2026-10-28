import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3379 official-style examples', () => {
  assert.deepEqual(solve([3, -2, 1, 1]), [1, 1, 1, 3])
  assert.deepEqual(solve([-1, 4, -1]), [-1, -1, 4])
})

test('3379 a single zero and a value out of range', () => {
  assert.deepEqual(solve([0]), [0])
  assert.throws(() => parseInput('[101]'))
  assert.throws(() => parseInput('[]'))
})

// Independent oracle: walk one step at a time instead of using a modular formula.
function oracle(nums) {
  const n = nums.length
  return nums.map((v, i) => {
    let pos = i
    const dir = v < 0 ? -1 : 1
    for (let s = 0; s < Math.abs(v); s++) pos = (pos + dir + n) % n
    return nums[pos]
  })
}

test('3379 random arrays match a step-by-step oracle', () => {
  let seed = 3379
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const nums = Array.from({ length: n }, () => rnd(201) - 100)
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
