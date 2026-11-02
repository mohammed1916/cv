import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3487 worked examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5]), 15)
  assert.equal(solve([1, 1, 0, 1, 1]), 1)
  assert.equal(solve([1, 2, -1, -2, 1, 0, -5]), 3)
})

test('3487 all non-positive values give the largest one', () => {
  assert.equal(solve([-3]), -3)
  assert.equal(solve([-5, -2, -9]), -2)
  assert.equal(solve([0, -4, 0]), 0)
})

test('3487 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1.5]'))
})

// Independent oracle: try every nonempty set of kept positions, then every contiguous window
// of the kept values that has no repeats.
function oracle(nums) {
  let best = -Infinity
  const n = nums.length
  for (let mask = 1; mask < 1 << n; mask++) {
    const kept = nums.filter((_, i) => mask & (1 << i))
    for (let a = 0; a < kept.length; a++) {
      const window = new Set()
      let sum = 0
      for (let b = a; b < kept.length; b++) {
        if (window.has(kept[b])) break
        window.add(kept[b])
        sum += kept[b]
        best = Math.max(best, sum)
      }
    }
  }
  return best
}

test('3487 random inputs match a brute-force oracle', () => {
  let seed = 3487
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(21) - 10)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
