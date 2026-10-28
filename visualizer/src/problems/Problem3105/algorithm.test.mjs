import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3105 examples', () => {
  assert.equal(solve([1, 4, 3, 3, 2]), 2)
  assert.equal(solve([3, 3, 3, 3]), 1)
  assert.equal(solve([3, 2, 1]), 3)
})

test('3105 a single element', () => {
  assert.equal(solve([5]), 1)
})

test('3105 rejects an empty array and a value of zero', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
})

// Independent oracle: check every subarray directly.
function oracle(nums) {
  let best = 1
  for (let l = 0; l < nums.length; l++) {
    for (let r = l; r < nums.length; r++) {
      const part = nums.slice(l, r + 1)
      const inc = part.every((v, i) => i === 0 || v > part[i - 1])
      const dec = part.every((v, i) => i === 0 || v < part[i - 1])
      if (inc || dec) best = Math.max(best, part.length)
    }
  }
  return best
}

test('3105 random arrays match an every-subarray oracle', () => {
  let seed = 3105
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(6))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
