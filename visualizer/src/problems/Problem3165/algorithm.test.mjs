import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const MOD = 1000000007
const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3165 official examples', () => {
  assert.equal(solve({ nums: [3, 5, 9], queries: [[1, -2], [0, -3]] }), 21)
  assert.equal(solve({ nums: [0, -1], queries: [[0, -5]] }), 0)
})

test('3165 an all-negative array contributes nothing', () => {
  // After the first query the array is [-5, 1], best 1. After the second it is [-5, -1], where the empty choice gives 0.
  assert.equal(solve({ nums: [1, 1], queries: [[0, -5], [1, -1]] }), 1)
})

test('3165 rejects a query position outside nums', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[2,1]]}'))
})

// Independent oracle: enumerate every subset of positions and keep the best one with no two adjacent positions.
function bestNonAdjacent(values) {
  let best = 0
  const n = values.length
  for (let mask = 0; mask < 1 << n; mask++) {
    let ok = true
    let sum = 0
    for (let i = 0; i < n && ok; i++) {
      if (!((mask >> i) & 1)) continue
      if (i + 1 < n && (mask >> (i + 1)) & 1) ok = false
      sum += values[i]
    }
    if (ok && sum > best) best = sum
  }
  return best
}

function oracle({ nums, queries }) {
  const values = [...nums]
  let total = 0
  for (const [pos, x] of queries) {
    values[pos] = x
    total += bestNonAdjacent(values)
  }
  return total % MOD
}

test('3165 seeded random inputs match a subset enumeration', () => {
  let seed = 3165
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => rnd(19) - 9)
    const queries = Array.from({ length: 1 + rnd(4) }, () => [rnd(nums.length), rnd(19) - 9])
    const input = { nums, queries }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
