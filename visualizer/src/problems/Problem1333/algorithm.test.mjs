import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const RESTAURANTS = [[1, 4, 1, 40, 10], [2, 8, 0, 50, 5], [3, 8, 1, 30, 4], [4, 10, 0, 10, 3], [5, 1, 1, 15, 1]]
const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1333 worked examples', () => {
  assert.deepEqual(solve({ restaurants: RESTAURANTS, veganFriendly: 1, maxPrice: 50, maxDistance: 10 }), [3, 1, 5])
  assert.deepEqual(solve({ restaurants: RESTAURANTS, veganFriendly: 0, maxPrice: 50, maxDistance: 10 }), [4, 3, 2, 1, 5])
  assert.deepEqual(solve({ restaurants: RESTAURANTS, veganFriendly: 1, maxPrice: 30, maxDistance: 3 }), [5])
})

// Independent oracle: filter, then sort by rating and id, both descending.
function oracle({ restaurants, veganFriendly, maxPrice, maxDistance }) {
  return restaurants
    .filter(([, , vegan, price, distance]) => (!veganFriendly || vegan === 1) && price <= maxPrice && distance <= maxDistance)
    .sort((a, b) => b[1] - a[1] || b[0] - a[0])
    .map(r => r[0])
}

test('1333 random inputs match a filter-and-sort oracle', () => {
  let seed = 1333
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(8)
    const restaurants = Array.from({ length: count }, (_, i) => [i + 1, 1 + rnd(10), rnd(2), 1 + rnd(60), 1 + rnd(12)])
    const input = { restaurants, veganFriendly: rnd(2), maxPrice: 1 + rnd(60), maxDistance: 1 + rnd(12) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
