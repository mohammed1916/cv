import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2465 official examples', () => {
  assert.equal(solve([4, 1, 4, 0, 3, 5]), 2)
  assert.equal(solve([1, 100]), 1)
  assert.equal(solve([1, 3, 3, 5]), 1)
})

test('2465 equal sums collapse to one average', () => {
  assert.equal(solve([0, 2, 1, 1]), 1)
})

test('2465 rejects an odd length', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3]}'))
})

// Independent oracle: repeatedly remove the current minimum and maximum, and collect averages in a set.
function oracle(nums) {
  const rest = [...nums]
  const averages = new Set()
  while (rest.length) {
    const lo = Math.min(...rest)
    rest.splice(rest.indexOf(lo), 1)
    const hi = Math.max(...rest)
    rest.splice(rest.indexOf(hi), 1)
    averages.add((lo + hi) / 2)
  }
  return averages.size
}

test('2465 random arrays match a remove-extremes oracle', () => {
  let seed = 2465
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 * (1 + rnd(10)) }, () => rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
