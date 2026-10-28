import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (inventory, orders) => buildTrace({ inventory, orders }).result

test('1648 official examples', () => {
  assert.equal(solve([2, 5], 4), 14)
  assert.equal(solve([3, 5], 6), 19)
})

test('1648 a single colour sells from its top count down', () => {
  assert.equal(solve([4], 4), 10)
})

test('1648 rejects more orders than balls', () => {
  assert.throws(() => parseInput(JSON.stringify({ inventory: [2], orders: 3 })))
})

// Independent oracle: try every colour choice for every sale and keep the best total.
function oracle(inventory, orders) {
  const rec = (counts, left) => {
    if (left === 0) return 0
    let best = 0
    for (let c = 0; c < counts.length; c++) {
      if (counts[c] === 0) continue
      const next = [...counts]
      next[c] -= 1
      best = Math.max(best, counts[c] + rec(next, left - 1))
    }
    return best
  }
  return rec(inventory, orders) % 1000000007
}

test('1648 random inputs match an exhaustive colour-choice oracle', () => {
  let seed = 1648
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const inventory = Array.from({ length: 1 + rnd(3) }, () => 1 + rnd(5))
    const total = inventory.reduce((a, b) => a + b, 0)
    const orders = 1 + rnd(Math.min(total, 6))
    assert.equal(solve(inventory, orders), oracle(inventory, orders), JSON.stringify({ inventory, orders }))
  }
})
