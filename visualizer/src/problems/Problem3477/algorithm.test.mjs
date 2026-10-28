import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (fruits, baskets) => buildTrace({ fruits, baskets }).result

test('3477 official example', () => {
  assert.equal(solve([4, 2, 5], [3, 5, 4]), 1)
})

test('3477 every fruit placed and every fruit unplaced', () => {
  assert.equal(solve([1, 1, 1], [1, 1, 1]), 0)
  assert.equal(solve([5, 5], [4, 4]), 2)
})

test('3477 rejects mismatched lengths', () => {
  assert.throws(() => parseInput('{"fruits":[1,2],"baskets":[1]}'), /same length/)
})

// Independent oracle: keep a list of free baskets and remove the first one that fits.
function oracle(fruits, baskets) {
  const free = baskets.map((capacity, index) => ({ capacity, index }))
  let unplaced = 0
  for (const quantity of fruits) {
    const at = free.findIndex(basket => basket.capacity >= quantity)
    if (at === -1) unplaced++
    else free.splice(at, 1)
  }
  return unplaced
}

test('3477 random inputs match a free-list oracle', () => {
  let seed = 3477
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const fruits = Array.from({ length: n }, () => 1 + rnd(20))
    const baskets = Array.from({ length: n }, () => 1 + rnd(20))
    assert.equal(solve(fruits, baskets), oracle(fruits, baskets), JSON.stringify({ fruits, baskets }))
  }
})
