import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('1330 worked examples', () => {
  assert.equal(solve([2, 3, 1, 5, 4]), 10)
  assert.equal(solve([2, 4, 9, 24, 2, 1, 10]), 68)
  assert.equal(solve([1, 5]), 4)
})

// Independent oracle: try every subarray reversal and keep the best total.
function oracle(nums) {
  const total = a => a.reduce((sum, v, i) => (i ? sum + Math.abs(v - a[i - 1]) : 0), 0)
  let best = total(nums)
  for (let l = 0; l < nums.length; l++) {
    for (let r = l; r < nums.length; r++) {
      const copy = [...nums]
      for (let i = l, j = r; i < j; i++, j--) [copy[i], copy[j]] = [copy[j], copy[i]]
      best = Math.max(best, total(copy))
    }
  }
  return best
}

test('1330 random arrays match an all-reversals oracle', () => {
  let seed = 1330
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(7) }, () => rnd(41) - 20)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
