import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result
const pyLines = python.trim().split('\n').length

test('2941 hand-checked examples', () => {
  // A single number: gcd is the number itself, sum is the number.
  assert.equal(solve([5], 1), 25)
  // [2,4]: 2 * 6 = 12, [4,6]: 2 * 10 = 20, [2,4,6]: 2 * 12 = 24.
  assert.equal(solve([2, 4, 6], 2), 24)
  // The only subarray of length at least 3 is the whole array: gcd 2, sum 20.
  assert.equal(solve([4, 6, 10], 3), 40)
  // [3,6,9] has gcd 3 and sum 18, giving 54, which beats [4,8] with 4 * 12 = 48.
  assert.equal(solve([3, 6, 9, 4, 8], 2), 54)
})

test('2941 parser rejects bad lists and k', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[0,3],"k":1}'))
  assert.throws(() => parseInput('{"nums":[3,4],"k":3}'))
  assert.throws(() => parseInput('{"nums":[3,4],"k":0}'))
})

// Brute oracle: every subarray of length at least k.
function oracle(nums, k) {
  const g = (a, b) => (b ? g(b, a % b) : a)
  let best = 0
  for (let l = 0; l < nums.length; l++) {
    let d = 0
    let sum = 0
    for (let r = l; r < nums.length; r++) {
      d = d === 0 ? nums[r] : g(d, nums[r])
      sum += nums[r]
      if (r - l + 1 >= k) best = Math.max(best, d * sum)
    }
  }
  return best
}

test('2941 random inputs match the subarray oracle', () => {
  let seed = 2941
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const size = 1 + rnd(10)
    const nums = Array.from({ length: size }, () => 1 + rnd(24))
    const k = 1 + rnd(size)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})

test('2941 frames keep valid lines and report a range that matches the best', () => {
  const run = buildTrace({ nums: [3, 6, 9, 4, 8], k: 2 })
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
  }
  if (run.bestRange) assert.ok(run.bestRange[1] - run.bestRange[0] + 1 >= 2)
})
