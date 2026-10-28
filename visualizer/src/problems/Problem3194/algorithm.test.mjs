import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3194 official examples', () => {
  assert.equal(solve([7, 8, 3, 4, 15, 13, 4, 1]), 5.5)
  assert.equal(solve([1, 9, 8, 3, 10, 5]), 5.5)
})

test('3194 two numbers', () => {
  assert.equal(solve([4, 10]), 7)
})

test('3194 rejects an odd count', () => {
  assert.throws(() => parseInput('[1, 2, 3]'))
})

// Independent oracle: repeatedly remove the current minimum and maximum, as the statement describes.
function oracle(nums) {
  const rest = [...nums].sort((a, b) => a - b)
  let best = Infinity
  while (rest.length > 0) {
    const low = rest.shift()
    const high = rest.pop()
    best = Math.min(best, (low + high) / 2)
  }
  return best
}

test('3194 random lists match a repeated-removal oracle', () => {
  let seed = 3194
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 * (1 + rnd(10)) }, () => 1 + rnd(50))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
