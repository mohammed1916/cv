import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3985 official examples', () => {
  assert.equal(solve([10, 10]), 20)
  assert.equal(solve([1, 2, 3, 2, 1, 5, 6]), 9)
  assert.equal(solve([7, 1, 2, 1, 7, 3, 4, 3, 4]), 18)
  assert.equal(solve([1, 2, 3, 4, 5]), 5)
  assert.equal(solve([1000]), 1000)
})

test('3985 a long palindrome beats a single large value', () => {
  assert.equal(solve([1, 1, 1, 1, 9]), 9)
  assert.equal(solve([4, 1, 4, 1, 4]), 14)
})

test('3985 rejects a zero value', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: test every subarray directly for being a palindrome.
function oracle(nums) {
  let best = -Infinity
  for (let l = 0; l < nums.length; l++) {
    for (let r = l; r < nums.length; r++) {
      const sub = nums.slice(l, r + 1)
      if (sub.join(',') === [...sub].reverse().join(',')) {
        best = Math.max(best, sub.reduce((a, b) => a + b, 0))
      }
    }
  }
  return best
}

test('3985 random arrays match an all-subarrays oracle', () => {
  let seed = 3985
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(4))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
