import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = edges => buildTrace({ edges }).result

test('2374 official examples', () => {
  assert.equal(solve([1, 0, 0, 0, 0, 7, 7, 5]), 7)
  assert.equal(solve([2, 0, 0, 2]), 0)
})

test('2374 edge case: a tie goes to the smaller index', () => {
  assert.equal(solve([1, 0]), 0)
  assert.equal(solve([0, 0]), 0)
})

test('2374 rejects an edge that points outside the array', () => {
  assert.throws(() => parseInput('{"edges":[1,4]}'))
})

// Independent oracle: for each candidate node, sum the indexes of the nodes that point to it, then take the best.
function oracle(edges) {
  const scores = edges.map((_, candidate) => edges.reduce((sum, target, i) => (target === candidate ? sum + i : sum), 0))
  let best = 0
  for (let node = 1; node < scores.length; node++) if (scores[node] > scores[best]) best = node
  return best
}

test('2374 random edge lists match a summing oracle', () => {
  let seed = 2374
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(7)
    const edges = Array.from({ length: n }, () => rnd(n))
    assert.equal(solve(edges), oracle(edges), JSON.stringify(edges))
  }
})
