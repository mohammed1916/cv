import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = edges => buildTrace({ edges }).result

test('2876 official examples', () => {
  assert.deepEqual(solve([1, 2, 0, 0]), [3, 3, 3, 4])
  assert.deepEqual(solve([1, 2, 3, 4, 0]), [5, 5, 5, 5, 5])
})

test('2876 edge cases: a two-node cycle and a tail into a cycle', () => {
  assert.deepEqual(solve([1, 0]), [2, 2])
  assert.deepEqual(solve([1, 2, 1]), [3, 2, 2])
})

test('2876 rejects a self-loop or an edge outside the array', () => {
  assert.throws(() => parseInput('{"edges":[0,1]}'))
  assert.throws(() => parseInput('{"edges":[1,3]}'))
})

// Independent oracle: from each node, follow the edges while collecting distinct nodes in a set.
function oracle(edges) {
  return edges.map((_, start) => {
    const seen = new Set()
    let cur = start
    while (!seen.has(cur)) {
      seen.add(cur)
      cur = edges[cur]
    }
    return seen.size
  })
}

test('2876 random functional graphs match a walk-and-collect oracle', () => {
  let seed = 2876
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(9)
    const edges = Array.from({ length: n }, (_, i) => {
      let target = rnd(n - 1)
      if (target >= i) target++
      return target
    })
    assert.deepEqual(solve(edges), oracle(edges), JSON.stringify(edges))
  }
})
