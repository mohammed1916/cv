import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = cost => buildTrace(parseInput(JSON.stringify({ cost }))).result

test('3502 official examples', () => {
  assert.deepEqual(solve([5, 3, 4, 1, 3, 2]), [5, 3, 3, 1, 1, 1])
  assert.deepEqual(solve([1, 2, 4, 6, 7]), [1, 1, 1, 1, 1])
})

test('3502 a single position pays its own cost', () => {
  assert.deepEqual(solve([7]), [7])
})

test('3502 rejects bad input', () => {
  assert.throws(() => parseInput('{"cost":[0]}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: brute force, the cheapest cost among every position up to i.
function oracle(cost) {
  return cost.map((_, i) => {
    let low = Infinity
    for (let j = 0; j <= i; j++) low = Math.min(low, cost[j])
    return low
  })
}

test('3502 random arrays match a brute-force oracle', () => {
  let seed = 3502
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const cost = Array.from({ length: 1 + rnd(20) }, () => 1 + rnd(100))
    assert.deepEqual(solve(cost), oracle(cost), JSON.stringify(cost))
  }
})
