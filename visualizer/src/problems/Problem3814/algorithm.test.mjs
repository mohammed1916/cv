import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

function brute({ costs, capacity, budget }) {
  let best = 0
  const n = costs.length
  for (let i = 0; i < n; i++) {
    if (costs[i] < budget) best = Math.max(best, capacity[i])
    for (let j = i + 1; j < n; j++) if (costs[i] + costs[j] < budget) best = Math.max(best, capacity[i] + capacity[j])
  }
  return best
}

test('3814 worked cases', () => {
  assert.equal(solve({ costs: [4, 8, 5, 3], capacity: [1, 5, 2, 7], budget: 8 }), 8)
  assert.equal(solve({ costs: [5, 5], capacity: [3, 4], budget: 5 }), 0)
  assert.equal(solve({ costs: [2, 3, 9], capacity: [4, 1, 20], budget: 10 }), 20)
})

test('3814 matches a brute force on fixed inputs', () => {
  const cases = [
    { costs: [7, 2, 9, 4, 4], capacity: [5, 8, 1, 6, 3], budget: 9 },
    { costs: [1, 1, 1], capacity: [2, 9, 4], budget: 3 },
    { costs: [10, 12, 3, 6, 8], capacity: [7, 2, 11, 1, 5], budget: 16 },
    { costs: [6, 6, 6, 1], capacity: [4, 4, 4, 2], budget: 7 },
  ]
  for (const input of cases) assert.equal(solve(input), brute(input))
})

test('3814 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ costs: [3, 1], capacity: [2, 5], budget: 5 }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3814 rejects mismatched lengths', () => {
  assert.throws(() => parseInput('{"costs":[1,2],"capacity":[1],"budget":3}'))
})
