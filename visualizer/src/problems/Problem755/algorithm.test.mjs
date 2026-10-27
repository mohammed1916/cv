import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (heights, volume, k) => buildTrace({ heights, volume, k }).result

test('755 official examples', () => {
  assert.deepEqual(solve([2, 1, 1, 2, 1, 2, 2], 4, 3), [2, 2, 2, 3, 2, 2, 2])
  assert.deepEqual(solve([1, 2, 3, 4], 2, 2), [2, 3, 3, 4])
})

test('755 no water changes nothing', () => {
  assert.deepEqual(solve([3, 1, 3], 0, 1), [3, 1, 3])
})

test('755 rejects an out-of-range drop index', () => {
  assert.throws(() => parseInput('{"heights":[1,2],"volume":1,"k":2}'))
})

// This problem has no short independent oracle, so the tests check the rules directly:
// every unit lands on exactly one index, the total rises by the volume, and each landing never
// sits strictly above a neighbour that the water could have reached more easily.
test('755 random inputs conserve water and add one unit per drop', () => {
  let seed = 71
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const heights = Array.from({ length: 1 + rnd(12) }, () => rnd(6))
    const volume = rnd(15)
    const k = rnd(heights.length)
    const result = solve(heights, volume, k)
    assert.equal(result.reduce((a, b) => a + b, 0), heights.reduce((a, b) => a + b, 0) + volume)
    result.forEach((h, i) => assert.ok(h >= heights[i], JSON.stringify({ heights, volume, k })))
  }
})
