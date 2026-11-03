import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('2832 small worked arrays', () => {
  assert.deepEqual(solve([1, 5, 4, 3, 6]), [1, 4, 2, 1, 5])
  assert.deepEqual(solve([7]), [1])
  assert.deepEqual(solve([2, 2, 2]), [3, 3, 3])
})

test('2832 strictly greater neighbours stop the range but equal values do not', () => {
  assert.deepEqual(solve([3, 1, 3]), [3, 1, 3])
  assert.deepEqual(solve([1, 2, 3, 2, 1]), [1, 2, 5, 2, 1])
})

test('2832 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0, 2]'))
  assert.throws(() => parseInput('[1.5]'))
})

// Oracle: for each index, scan every subarray that contains it and check whether nums[i] is its maximum.
function oracle(nums) {
  return nums.map((_, i) => {
    let best = 1
    for (let l = 0; l <= i; l++) {
      for (let r = i; r < nums.length; r++) {
        const slice = nums.slice(l, r + 1)
        if (slice.every(v => v <= nums[i])) best = Math.max(best, r - l + 1)
      }
    }
    return best
  })
}

test('2832 random arrays match a brute-force oracle', () => {
  let seed = 2832
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(5))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('2832 every frame points at real pseudocode and python lines', () => {
  const run = buildTrace([4, 1, 4, 2])
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
    assert.equal(f.left.length, 4)
  }
})
