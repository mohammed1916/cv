import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Independent oracle: try every removal (or none), then test every contiguous window for alternation directly.
function alternating(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1]) return false
    if (i >= 2 && (arr[i] > arr[i - 1]) === (arr[i - 1] > arr[i - 2])) return false
  }
  return true
}

function oracle(nums) {
  const versions = [nums]
  for (let i = 0; i < nums.length; i++) versions.push([...nums.slice(0, i), ...nums.slice(i + 1)])
  let best = 0
  for (const arr of versions) {
    for (let a = 0; a < arr.length; a++) {
      for (let b = a; b < arr.length; b++) {
        if (alternating(arr.slice(a, b + 1))) best = Math.max(best, b - a + 1)
      }
    }
  }
  return best
}

test('3830 official examples', () => {
  assert.equal(solve([2, 1, 3, 2]), 4)
  assert.equal(solve([3, 2, 1, 2, 3, 2, 1]), 4)
  assert.equal(solve([100000, 100000]), 1)
})

test('3830 deleting one equal neighbour can join two runs', () => {
  // Removing the middle 5 leaves 1, 9, 2, 8, which alternates fully.
  assert.equal(solve([1, 9, 5, 2, 8]), 4)
})

test('3830 rejects a single element', () => {
  assert.throws(() => parseInput('{"nums":[4]}'))
})

test('3830 random arrays match the every-removal oracle', () => {
  let seed = 3830
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(8) }, () => 1 + rnd(5))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
