import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (prices, costs, cooldown) => buildTrace({ prices, costs, cooldown }).result

test('4069 hand-checked markets', () => {
  assert.equal(solve([1, 2, 3], [0, 0, 0], 0), 2)
  assert.equal(solve([1, 2, 3], [0, 0, 0], 1), 2)
  assert.equal(solve([4, 3, 2], [0, 5, 5], 0), 0)
  assert.equal(solve([5], [0], 0), 0)
})

test('4069 rejects bad input', () => {
  assert.throws(() => parseInput('{"prices":[1,2],"costs":[0],"cooldown":0}'))
  assert.throws(() => parseInput('{"prices":[1,2],"costs":[0,0],"cooldown":-1}'))
})

// Oracle: choose trades from the start day onward, recursively, with no table of best sell days.
function oracle(prices, costs, cooldown) {
  const n = prices.length
  const best = s => {
    let out = 0
    for (let i = s; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const gain = prices[j] - prices[i] - costs[j - i] + best(j + cooldown + 1)
        if (gain > out) out = gain
      }
    }
    return out
  }
  return best(0)
}

test('4069 random markets match the recursive trade oracle', () => {
  let seed = 4069
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const prices = Array.from({ length: n }, () => rnd(20))
    const costs = Array.from({ length: n }, () => rnd(6))
    const cooldown = rnd(3)
    assert.equal(solve(prices, costs, cooldown), oracle(prices, costs, cooldown), JSON.stringify({ prices, costs, cooldown }))
  }
})
