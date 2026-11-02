import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2860 worked examples', () => {
  assert.equal(solve([1, 1]), 2)
  assert.equal(solve([6, 0, 3, 3, 6, 7, 2, 7]), 3)
})

test('2860 edge cases', () => {
  assert.equal(solve([0]), 1)
  assert.equal(solve([0, 0]), 1)
  assert.equal(solve([1, 0]), 1)
})

test('2860 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[5,0]}'))
})

// Independent oracle: try every subset of students and check every happiness rule.
function oracle(nums) {
  const n = nums.length
  let ways = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let size = 0
    for (let i = 0; i < n; i++) if (mask & (1 << i)) size++
    const allHappy = nums.every((v, i) => {
      const selected = (mask & (1 << i)) !== 0
      return selected ? size > v : size < v
    })
    if (allHappy) ways++
  }
  return ways
}

test('2860 random inputs match a subset-enumeration oracle', () => {
  let seed = 2860
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 0)
    for (let i = 0; i < nums.length; i++) nums[i] = rnd(nums.length)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
