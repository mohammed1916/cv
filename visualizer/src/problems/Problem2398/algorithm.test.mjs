import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2398 official examples', () => {
  assert.equal(solve({ charge_times: [3, 6, 1, 3, 4], running_costs: [2, 1, 3, 4, 5], budget: 25 }), 3)
  assert.equal(solve({ charge_times: [11, 12, 19], running_costs: [10, 8, 7], budget: 19 }), 0)
})

test('2398 rejects mismatched arrays', () => {
  assert.throws(() => parseInput('{"charge_times":[1,2],"running_costs":[1],"budget":5}'), /same length/)
})

// Independent oracle: test every contiguous block directly instead of using a deque.
function oracle({ charge_times: charge, running_costs: running, budget }) {
  let best = 0
  for (let i = 0; i < charge.length; i++) {
    for (let j = i; j < charge.length; j++) {
      let maxCharge = 0, total = 0
      for (let k = i; k <= j; k++) { maxCharge = Math.max(maxCharge, charge[k]); total += running[k] }
      if (maxCharge + (j - i + 1) * total <= budget) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

test('2398 seeded random cases match brute force', () => {
  let seed = 2398
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const input = { charge_times: Array.from({ length: n }, () => 1 + rnd(30)), running_costs: Array.from({ length: n }, () => 1 + rnd(30)), budget: 1 + rnd(300) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
