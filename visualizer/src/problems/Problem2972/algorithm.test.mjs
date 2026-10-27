import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2972 official examples', () => {
  assert.equal(solve([1, 2, 3, 4]), 10)
  assert.equal(solve([6, 5, 7, 8]), 7)
  assert.equal(solve([8, 7, 6, 6]), 3)
})

test('2972 a single element is always removable', () => {
  assert.equal(solve([5]), 1)
})

test('2972 rejects values outside 1 to 10', () => {
  assert.throws(() => parseInput('{"nums":[0,2]}'))
})

// Independent oracle: test every subarray by rebuilding the remaining array.
function oracle(nums) {
  const n = nums.length
  let count = 0
  for (let l = 0; l < n; l++) {
    for (let r = l; r < n; r++) {
      const rest = [...nums.slice(0, l), ...nums.slice(r + 1)]
      if (rest.every((v, k) => k === 0 || rest[k - 1] < v)) count++
    }
  }
  return count
}

test('2972 random arrays match a brute-force oracle', () => {
  let seed = 2972
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(6))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
