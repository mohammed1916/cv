import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3630 official examples', () => {
  assert.equal(solve([2, 3]), 5)
  assert.equal(solve([1, 3, 2]), 6)
  assert.equal(solve([2, 3, 6, 7]), 15)
})

test('3630 a single element goes to A or B', () => {
  assert.equal(solve([5]), 5)
})

test('3630 rejects an empty array and an oversized one', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1,2,3,4,5,6,7,8,9]'))
})

// Independent oracle: enumerate all 3^n assignments of elements to A, B and C.
function oracle(nums) {
  const n = nums.length
  let best = 0
  let total = 1
  for (let i = 0; i < n; i++) total *= 3
  for (let code = 0; code < total; code++) {
    let c = code
    const groups = [[], [], []]
    for (let i = 0; i < n; i++) { groups[c % 3].push(nums[i]); c = Math.floor(c / 3) }
    const xorOf = g => g.reduce((a, b) => a ^ b, 0)
    const andOf = g => (g.length === 0 ? 0 : g.reduce((a, b) => a & b))
    best = Math.max(best, xorOf(groups[0]) + andOf(groups[1]) + xorOf(groups[2]))
  }
  return best
}

test('3630 random arrays match a 3^n enumeration oracle', () => {
  let seed = 3630
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(63))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
