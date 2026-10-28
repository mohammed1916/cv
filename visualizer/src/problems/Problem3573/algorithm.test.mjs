import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (prices, k) => buildTrace(parseInput(JSON.stringify({ prices, k }))).result

test('3573 official examples', () => {
  assert.equal(solve([1, 7, 9, 8, 2], 2), 14)
  assert.equal(solve([12, 16, 19, 19, 8, 1, 19, 13, 9], 3), 36)
})

test('3573 a short sale on a falling price is profitable', () => {
  assert.equal(solve([5, 1], 1), 4)
})

test('3573 rejects k above half the days', () => {
  assert.throws(() => parseInput('{"prices":[1,2,3],"k":2}'))
})

// Independent oracle: choose up to k transactions as day pairs, each starting after the previous one ends, and keep the best total.
function oracle(prices, k) {
  const pairs = []
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      pairs.push({ i, j, profit: prices[j] - prices[i] })
      pairs.push({ i, j, profit: prices[i] - prices[j] })
    }
  }
  let best = 0
  const pick = (from, lastEnd, count, total) => {
    best = Math.max(best, total)
    if (count === k) return
    for (let q = from; q < pairs.length; q++) {
      if (pairs[q].i <= lastEnd) continue
      pick(q + 1, pairs[q].j, count + 1, total + pairs[q].profit)
    }
  }
  pick(0, -1, 0, 0)
  return best
}

test('3573 random price lists match a disjoint-pairs oracle', () => {
  let seed = 3573
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 120; trial++) {
    const n = 2 + rnd(6)
    const prices = Array.from({ length: n }, () => 1 + rnd(20))
    const k = 1 + rnd(Math.floor(n / 2))
    assert.equal(solve(prices, k), oracle(prices, k), JSON.stringify({ prices, k }))
  }
})
