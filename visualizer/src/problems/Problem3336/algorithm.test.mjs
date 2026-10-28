import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3336 official examples', () => {
  assert.equal(solve([1, 2, 3, 4]), 10)
  assert.equal(solve([10, 20, 30]), 2)
  assert.equal(solve([1, 1, 1, 1]), 50)
})

test('3336 rejects values outside 1 to 40', () => {
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[41]'))
})

// Independent oracle: give every element to the first sequence, the second sequence, or neither, then check both gcds.
function oracle(nums) {
  const n = nums.length
  const gcdOf = list => list.reduce((g, v) => { let a = g, b = v; while (b) [a, b] = [b, a % b]; return a }, 0)
  let count = 0
  let assignments = 1
  for (let i = 0; i < n; i++) assignments *= 3
  for (let code = 0; code < assignments; code++) {
    let c = code
    const first = []
    const second = []
    for (let i = 0; i < n; i++) {
      const choice = c % 3
      c = Math.floor(c / 3)
      if (choice === 1) first.push(nums[i])
      if (choice === 2) second.push(nums[i])
    }
    if (first.length && second.length && gcdOf(first) === gcdOf(second)) count++
  }
  return count % 1000000007
}

test('3336 random inputs match a three-way assignment oracle', () => {
  let seed = 3336
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
