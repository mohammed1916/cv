import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('2519 worked examples', () => {
  assert.equal(solve([2, 3, 6, 5, 2, 3], 2), 2)
  assert.equal(solve([1, 1, 1], 0), 3)
  assert.equal(solve([5, 4, 3], 1), 0)
})

test('2519 equal values are not smaller', () => {
  assert.equal(solve([4, 4, 4, 4, 4], 1), 0)
})

test('2519 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":-1}'))
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
})

// Oracle: value-frequency tables. Count how many values below nums[i] appear before and after position i.
function oracle(nums, k) {
  const maxV = Math.max(...nums)
  let count = 0
  nums.forEach((v, i) => {
    const freqLeft = Array(maxV + 2).fill(0), freqRight = Array(maxV + 2).fill(0)
    for (let j = 0; j < i; j++) freqLeft[nums[j]]++
    for (let j = i + 1; j < nums.length; j++) freqRight[nums[j]]++
    let before = 0, after = 0
    for (let x = 1; x < v; x++) { before += freqLeft[x]; after += freqRight[x] }
    if (before >= k && after >= k) count++
  })
  return count
}

test('2519 random arrays match a frequency-table oracle', () => {
  let seed = 2519
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(8))
    const k = rnd(5)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
