import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = piles => buildTrace({ piles }).result

test('1561 sample piles give the expected totals', () => {
  assert.equal(solve([9, 1, 5, 3, 8, 2]), 11)
  assert.equal(solve([2, 4, 1, 2, 7, 8]), 9)
  assert.equal(solve([1, 1, 1]), 1)
})

test('1561 rejects malformed piles', () => {
  assert.throws(() => parseInput('{"piles":[1,2]}'), /multiple of 3/)
  assert.throws(() => parseInput('{"piles":[1,2,0]}'), /1 to 1000/)
  assert.throws(() => parseInput('[1,2,3]'), /object/)
})

// Oracle: try every partition of the piles into triples. Alice takes the largest and Bob the smallest of each triple,
// so you receive the middle value; the best partition maximises the sum of those middle values.
function bestMiddles(values) {
  if (values.length === 0) return 0
  const [first, ...rest] = values
  let best = -Infinity
  for (let i = 0; i < rest.length; i++) {
    for (let j = i + 1; j < rest.length; j++) {
      const triple = [first, rest[i], rest[j]].sort((a, b) => a - b)
      const others = rest.filter((_, k) => k !== i && k !== j)
      best = Math.max(best, triple[1] + bestMiddles(others))
    }
  }
  return best
}

test('1561 greedy total matches the exhaustive partition search', () => {
  let seed = 9
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 200; t++) {
    const piles = Array.from({ length: 3 * (1 + rnd(3)) }, () => 1 + rnd(50))
    const input = JSON.stringify({ piles })
    parseInput(input)
    assert.equal(solve(piles), bestMiddles(piles), input)
  }
})
