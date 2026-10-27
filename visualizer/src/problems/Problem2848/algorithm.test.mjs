import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2848 official examples', () => {
  assert.equal(solve([[3, 6], [1, 5], [4, 7]]), 7)
  assert.equal(solve([[1, 3], [5, 8]]), 7)
})

test('2848 overlapping cars count each point once', () => {
  assert.equal(solve([[2, 4], [3, 4]]), 3)
})

test('2848 rejects a car that ends before it starts', () => {
  assert.throws(() => parseInput('{"nums":[[5,3]]}'))
})

// Independent oracle: test each point from 1 to 100 directly against every car.
function oracle(nums) {
  let count = 0
  for (let p = 1; p <= 100; p++) {
    if (nums.some(([s, e]) => s <= p && p <= e)) count++
  }
  return count
}

test('2848 seeded random cars match a point-by-point check', () => {
  let seed = 2848
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(12)
    const nums = Array.from({ length: count }, () => {
      const a = 1 + rnd(100)
      const b = 1 + rnd(100)
      return [Math.min(a, b), Math.max(a, b)]
    })
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
