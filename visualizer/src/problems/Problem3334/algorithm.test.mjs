import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3334 official examples', () => {
  assert.equal(solve([2, 4, 8, 16]), 64)
  assert.equal(solve([1, 2, 3, 4, 5]), 60)
  assert.equal(solve([3]), 9)
})

test('3334 equal values keep gcd times lcm', () => {
  assert.equal(solve([5, 5]), 25)
})

test('3334 rejects a zero value', () => {
  assert.throws(() => parseInput('{"nums":[0,2]}'))
})

// Independent oracle: enumerate every subset that keeps at least n - 1 elements and score each by its gcd and lcm.
function oracle(nums) {
  const gcdOf = (a, b) => { while (b) [a, b] = [b, a % b]; return a }
  const n = nums.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const kept = nums.filter((_, i) => mask & (1 << i))
    if (kept.length < n - 1 || kept.length === 0) continue
    let g = 0
    let l = 1
    for (const v of kept) {
      g = gcdOf(g, v)
      l = (l * v) / gcdOf(l, v)
    }
    best = Math.max(best, g * l)
  }
  return best
}

test('3334 random arrays match a subset-enumeration oracle', () => {
  let seed = 3334
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(30))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
