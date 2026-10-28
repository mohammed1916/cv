import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2870 official examples', () => {
  assert.equal(solve([2, 3, 3, 2, 2, 4, 2, 3, 4]), 4)
  assert.equal(solve([2, 1, 2, 2, 3, 3]), -1)
})

test('2870 a count of four needs two operations', () => {
  assert.equal(solve([5, 5, 5, 5]), 2)
  assert.equal(solve([7, 7]), 1)
})

test('2870 rejects values outside 1 to 10 and bad lengths', () => {
  assert.throws(() => parseInput('[11, 11]'))
  assert.throws(() => parseInput('[1]'))
  assert.throws(() => parseInput('"abc"'))
})

// Independent oracle: dynamic programming over the size of one group of equal values.
function groupCost(n) {
  const best = [0, Infinity]
  for (let size = 2; size <= n; size++) {
    let cost = Infinity
    if (size >= 2) cost = Math.min(cost, best[size - 2] + 1)
    if (size >= 3) cost = Math.min(cost, best[size - 3] + 1)
    best[size] = cost
  }
  return best[n]
}

function oracle(nums) {
  const counts = new Map()
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1)
  let total = 0
  for (const c of counts.values()) {
    const cost = groupCost(c)
    if (cost === Infinity) return -1
    total += cost
  }
  return total
}

test('2870 random arrays match a dynamic-programming oracle', () => {
  let seed = 2870
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 2 + rnd(15)
    const nums = Array.from({ length: len }, () => 1 + rnd(6))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
