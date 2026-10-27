import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2748 official example', () => {
  assert.equal(solve([2, 5, 1, 4]), 5)
  assert.equal(solve([11, 21, 12]), 2)
})

test('2748 a pair with a shared digit factor is not beautiful', () => {
  assert.equal(solve([2, 4]), 0)
})

test('2748 rejects a value with no digits', () => {
  assert.throws(() => parseInput('{"nums":[0,5]}'))
})

// Independent oracle: check every pair in index order with the first digit as a string and the last digit as a string.
function oracle(nums) {
  const gcdLoop = (a, b) => { while (b) [a, b] = [b, a % b]; return a }
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const first = Number(String(nums[i])[0])
      const last = Number(String(nums[j]).slice(-1))
      if (gcdLoop(first, last) === 1) count++
    }
  }
  return count
}

test('2748 random arrays match a pairwise oracle', () => {
  let seed = 2748
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(8) }, () => 1 + rnd(9999))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
