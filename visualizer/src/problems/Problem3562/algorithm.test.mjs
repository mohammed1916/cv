import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3562 official-style examples', () => {
  assert.equal(solve({ n: 2, present: [1, 2], future: [4, 3], hierarchy: [[1, 2]], budget: 3 }), 5)
  assert.equal(solve({ n: 2, present: [3, 4], future: [5, 8], hierarchy: [[1, 2]], budget: 4 }), 4)
})

test('3562 a zero budget buys nothing and a discount needs the boss to buy', () => {
  assert.equal(solve({ n: 2, present: [1, 2], future: [4, 3], hierarchy: [[1, 2]], budget: 0 }), 0)
  // Boss costs 2 and is worth 3 (profit 1); the report costs 1 after the discount (profit 2).
  assert.equal(solve({ n: 2, present: [2, 2], future: [3, 3], hierarchy: [[1, 2]], budget: 3 }), 3)
})

test('3562 rejects two bosses for one employee and a boss for employee 1', () => {
  assert.throws(() => parseInput(JSON.stringify({ n: 3, present: [1, 1, 1], future: [2, 2, 2], hierarchy: [[1, 2], [3, 2]], budget: 5 })))
  assert.throws(() => parseInput(JSON.stringify({ n: 2, present: [1, 1], future: [2, 2], hierarchy: [[2, 1]], budget: 5 })))
})

// Independent oracle: try every subset of employees to buy, price each purchase at full or half
// (half when the direct boss is in the subset), reject subsets over budget, and keep the best.
function oracle({ n, present, future, hierarchy, budget }) {
  const boss = Array(n + 1).fill(0)
  for (const [b, e] of hierarchy) boss[e] = b
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let cost = 0
    let profit = 0
    for (let e = 1; e <= n; e++) {
      if (!(mask & (1 << (e - 1)))) continue
      const discounted = boss[e] !== 0 && (mask & (1 << (boss[e] - 1))) !== 0
      const price = discounted ? Math.floor(present[e - 1] / 2) : present[e - 1]
      cost += price
      profit += future[e - 1] - price
    }
    if (cost <= budget && profit > best) best = profit
  }
  return best
}

test('3562 random hierarchies match a subset-enumeration oracle', () => {
  let seed = 3562
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const hierarchy = []
    for (let e = 2; e <= n; e++) hierarchy.push([1 + rnd(e - 1), e])
    const present = Array.from({ length: n }, () => 1 + rnd(9))
    const future = Array.from({ length: n }, () => 1 + rnd(15))
    const input = { n, present, future, hierarchy, budget: rnd(26) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
