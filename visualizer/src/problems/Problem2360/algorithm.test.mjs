import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = edges => buildTrace(parseInput(JSON.stringify({ edges }))).result

test('2360 official examples', () => {
  assert.equal(solve([3, 3, 4, 2, 3]), 3)
  assert.equal(solve([2, -1, 3, 1]), -1)
})

test('2360 a self loop is a cycle of length one', () => {
  assert.equal(solve([0, 1]), 1)
})

test('2360 rejects an out-of-range edge', () => {
  assert.throws(() => parseInput('{"edges":[1,5]}'))
})

// Independent oracle: from each node, follow edges for at most n steps; the first return to the start gives its cycle.
function oracle(edges) {
  const n = edges.length
  let best = -1
  for (let i = 0; i < n; i++) {
    let node = edges[i]
    for (let steps = 1; steps <= n && node !== -1; steps++) {
      if (node === i) {
        best = Math.max(best, steps)
        break
      }
      node = edges[node]
    }
  }
  return best
}

test('2360 random graphs match a walk-from-each-node oracle', () => {
  let seed = 2360
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const edges = Array.from({ length: n }, () => (rnd(4) === 0 ? -1 : rnd(n)))
    assert.equal(solve(edges), oracle(edges), JSON.stringify(edges))
  }
})
