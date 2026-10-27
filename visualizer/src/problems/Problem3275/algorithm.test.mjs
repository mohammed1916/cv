import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3275 official examples', () => {
  assert.deepEqual(solve({ queries: [[1, 2], [3, 4], [2, 3], [-3, 0]], k: 2 }), [-1, 7, 5, 3])
  assert.deepEqual(solve({ queries: [[5, 5], [4, 4], [3, 3]], k: 1 }), [10, 8, 6])
})

test('3275 repeated points count as separate obstacles', () => {
  assert.deepEqual(solve({ queries: [[2, 2], [-2, 2], [0, 0]], k: 2 }), [-1, 4, 4])
})

test('3275 rejects a coordinate outside the range', () => {
  assert.throws(() => parseInput('{"queries":[[11,0]],"k":1}'))
})

// Independent oracle: after each query, sort every distance seen so far and read the kth one.
function oracle({ queries, k }) {
  const seen = []
  return queries.map(([x, y]) => {
    seen.push(Math.abs(x) + Math.abs(y))
    if (seen.length < k) return -1
    return [...seen].sort((a, b) => a - b)[k - 1]
  })
}

test('3275 seeded random inputs match a sort-each-time oracle', () => {
  let seed = 3275
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const queries = Array.from({ length: n }, () => [rnd(11) - 5, rnd(11) - 5])
    const input = { queries, k: 1 + rnd(8) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
