import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3020 worked examples', () => {
  assert.equal(solve([5, 4, 1, 2, 2]), 3)
  assert.equal(solve([1, 3, 2, 4]), 1)
})

test('3020 edge cases', () => {
  assert.equal(solve([1]), 1)
  assert.equal(solve([1, 1]), 1)
  assert.equal(solve([1, 1, 1]), 3)
  assert.equal(solve([2, 2]), 1)
  assert.equal(solve([2, 2, 4]), 3)
  assert.equal(solve([3, 9, 3, 9, 81]), 5)
  assert.throws(() => parseInput('[0]'))
})

// Independent oracle: enumerate every subset and test whether it equals a valid pattern.
function patternOf(x, levels) {
  const up = [x]
  for (let i = 1; i <= levels; i++) up.push(up[i - 1] ** 2)
  const down = up.slice(0, -1).reverse()
  return [...up, ...down].sort((a, b) => a - b).join(',')
}

function oracle(nums) {
  let best = 0
  const n = nums.length
  for (let mask = 1; mask < 1 << n; mask++) {
    const subset = nums.filter((_, i) => mask & (1 << i)).sort((a, b) => a - b)
    if (subset.length <= best) continue
    let ok = false
    for (const x of subset) for (let levels = 0; levels <= 3 && !ok; levels++) {
      if (patternOf(x, levels) === subset.join(',')) ok = true
    }
    if (ok) best = subset.length
  }
  return best
}

test('3020 random inputs match a subset oracle', () => {
  let seed = 3020
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const len = 1 + rnd(8)
    const nums = Array.from({ length: len }, () => [1, 2, 3, 4, 9, 16][rnd(6)])
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
