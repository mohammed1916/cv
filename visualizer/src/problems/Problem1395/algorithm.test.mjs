import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = rating => buildTrace({ rating }).result

test('1395 worked examples', () => {
  assert.equal(solve([2, 5, 3, 4, 1]), 3)
  assert.equal(solve([2, 1, 3]), 0)
  assert.equal(solve([1, 2, 3, 4]), 4)
})

test('1395 rejects repeated or too-short ratings', () => {
  assert.throws(() => parseInput('{"rating":[1,1,2]}'))
  assert.throws(() => parseInput('{"rating":[1,2]}'))
})

// Oracle: enumerate every index triple.
function oracle(rating) {
  let count = 0
  for (let i = 0; i < rating.length; i++) for (let j = i + 1; j < rating.length; j++) for (let k = j + 1; k < rating.length; k++) {
    if ((rating[i] < rating[j] && rating[j] < rating[k]) || (rating[i] > rating[j] && rating[j] > rating[k])) count++
  }
  return count
}

test('1395 random inputs match a triple-enumeration oracle', () => {
  let seed = 1395
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 3 + rnd(7)
    const pool = Array.from({ length: 30 }, (_, i) => i + 1)
    const rating = []
    for (let i = 0; i < size; i++) rating.push(pool.splice(rnd(pool.length), 1)[0])
    assert.equal(solve(rating), oracle(rating), JSON.stringify(rating))
  }
})
