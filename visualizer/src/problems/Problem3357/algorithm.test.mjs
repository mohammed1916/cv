import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Oracle: try every pair up to 25 and every x-or-y choice for each -1, without any range argument.
function brute(nums) {
  const missing = nums.map((v, i) => (v === -1 ? i : -1)).filter(i => i >= 0)
  let best = Infinity
  for (let x = 1; x <= 25; x++) for (let y = x; y <= 25; y++) {
    for (let mask = 0; mask < 1 << missing.length; mask++) {
      const arr = [...nums]
      missing.forEach((pos, k) => { arr[pos] = mask & (1 << k) ? y : x })
      let worst = 0
      for (let i = 1; i < arr.length; i++) worst = Math.max(worst, Math.abs(arr[i] - arr[i - 1]))
      best = Math.min(best, worst)
    }
  }
  return best
}

test('3357 worked cases', () => {
  assert.equal(solve([1, 2, -1, 10, 8]), 4)
  assert.equal(solve([-1, -1, -1]), 0)
  assert.equal(solve([-1, 10, -1, 8]), 1)
})

test('3357 agrees with exhaustive search on small inputs', () => {
  let s = 11
  const rand = n => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s % n }
  for (let trial = 0; trial < 80; trial++) {
    const len = 2 + rand(5)
    const nums = Array.from({ length: len }, () => (rand(3) === 0 ? -1 : 1 + rand(12)))
    assert.equal(solve(nums), brute(nums), JSON.stringify(nums))
  }
})

test('3357 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[1]}'))
  assert.throws(() => parseInput('{"nums":[1,0]}'))
})
