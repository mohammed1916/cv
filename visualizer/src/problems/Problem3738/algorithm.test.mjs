import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('3738 hand checked cases', () => {
  assert.equal(solve([1, 2, 3, 1, 2]), 4)
  assert.equal(solve([5, 4, 3, 2, 1]), 2)
  assert.equal(solve([1, 1, 1]), 3)
  assert.equal(solve([7]), 1)
  assert.equal(solve([3, 1, 2]), 3)
  assert.equal(solve([1, 3, 2, 4]), 4)
})

test('3738 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('[21]'))
})

test('3738 every frame points at a real pseudocode line', () => {
  for (const frame of buildTrace([1, 3, 2, 4, 0]).frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
})

// Independent oracle: test every window and ask whether one position can be freed to make it non-decreasing.
function oracle(nums) {
  const n = nums.length
  let best = 0
  for (let l = 0; l < n; l++) {
    for (let r = l; r < n; r++) {
      let ok = false
      for (let p = l; p <= r && !ok; p++) {
        let fine = true
        for (let q = l; q < r; q++) {
          if (q === p || q + 1 === p) continue
          if (nums[q] > nums[q + 1]) fine = false
        }
        if (p - 1 >= l && p + 1 <= r && nums[p - 1] > nums[p + 1]) fine = false
        ok = fine
      }
      if (ok) best = Math.max(best, r - l + 1)
    }
  }
  return best
}

test('3738 random arrays match the window oracle', () => {
  let seed = 3738
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let k = 0; k < 200; k++) {
    const length = 1 + rnd(10)
    const arr = Array.from({ length }, () => rnd(7) - 3)
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
