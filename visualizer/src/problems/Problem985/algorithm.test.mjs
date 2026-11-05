import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: apply each query to a copy and re-add all even values from scratch.
function bruteForce(nums, queries) {
  const values = [...nums]
  return queries.map(([value, index]) => {
    values[index] += value
    return values.filter(x => x % 2 === 0).reduce((sum, x) => sum + x, 0)
  })
}

test('985 running even sums match a full recount after each query', () => {
  const cases = [
    { nums: [1, 2, 3, 4], queries: [[1, 0], [-3, 1], [-4, 0], [2, 3]] },
    { nums: [1], queries: [[4, 0]] },
    { nums: [-2, 5, 8, -7], queries: [[3, 0], [2, 1], [-8, 2], [6, 3], [0, 0]] },
    { nums: [10, 20, 30], queries: [[-10, 0], [1, 1], [-20, 1], [5, 2]] },
  ]
  for (const input of cases) {
    const run = buildTrace(parseInput(JSON.stringify(input)))
    assert.deepEqual(run.result, bruteForce(input.nums, input.queries), JSON.stringify(input))
  }
})
