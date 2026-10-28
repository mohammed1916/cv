import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Independent oracle: for each window, try every single replacement value in a wide range and test the result directly.
function oracle(nums) {
  const n = nums.length
  let best = 2
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const window = nums.slice(a, b + 1)
      let ok = window.length <= 2
      for (let k = 0; k < window.length && !ok; k++) {
        for (let v = -60; v <= 60 && !ok; v++) {
          const arr = window.slice()
          arr[k] = v
          const step = arr[1] - arr[0]
          ok = arr.every((x, i) => i === 0 || x - arr[i - 1] === step)
        }
      }
      if (ok) best = Math.max(best, window.length)
    }
  }
  return best
}

test('3872 official examples', () => {
  assert.equal(solve([9, 7, 5, 10, 1]), 5)
  assert.equal(solve([1, 2, 6, 7]), 3)
})

test('3872 rejects an array shorter than 4', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3]}'))
})

test('3872 random arrays match the replacement-search oracle', () => {
  let seed = 3872
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 4 + rnd(3) }, () => 1 + rnd(9))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
