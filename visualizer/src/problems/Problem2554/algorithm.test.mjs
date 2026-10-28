import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (banned, n, maxSum) => buildTrace({ banned, n, maxSum }).result

test('2554 official examples', () => {
  assert.equal(solve([1, 6, 5], 5, 6), 2)
  assert.equal(solve([1, 2, 3, 4, 5, 7], 8, 1), 0)
})

test('2554 with nothing banned the smallest integers are taken first', () => {
  assert.equal(solve([], 10, 10), 4)
})

test('2554 rejects a negative limit', () => {
  assert.throws(() => parseInput(JSON.stringify({ banned: [], n: 3, maxSum: 0 })))
})

// Independent oracle: try every subset of the allowed integers and keep the largest one within the limit.
function oracle(banned, n, maxSum) {
  const blocked = new Set(banned)
  const allowed = []
  for (let v = 1; v <= n; v++) if (!blocked.has(v)) allowed.push(v)
  let best = 0
  for (let mask = 0; mask < 1 << allowed.length; mask++) {
    let sum = 0
    let count = 0
    for (let i = 0; i < allowed.length; i++) {
      if (mask & (1 << i)) { sum += allowed[i]; count++ }
    }
    if (sum <= maxSum) best = Math.max(best, count)
  }
  return best
}

test('2554 random inputs match a subset oracle', () => {
  let seed = 2554
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const banned = Array.from({ length: rnd(5) }, () => 1 + rnd(14))
    const maxSum = 1 + rnd(40)
    assert.equal(solve(banned, n, maxSum), oracle(banned, n, maxSum), JSON.stringify({ banned, n, maxSum }))
  }
})
