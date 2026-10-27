import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2509 statement examples', () => {
  assert.deepEqual(solve({ n: 3, queries: [[5, 3], [4, 7], [2, 3]] }), [4, 5, 3])
  assert.deepEqual(solve({ n: 2, queries: [[1, 2]] }), [2])
})

test('2509 rejects a label outside the tree', () => {
  assert.throws(() => parseInput('{"n":2,"queries":[[4,1]]}'))
})

// Independent oracle: build the explicit graph of the tree and run breadth-first search between the labels.
function oracle({ n, queries }) {
  const count = 2 ** n - 1
  const adj = Array.from({ length: count + 1 }, () => [])
  for (let v = 2; v <= count; v++) {
    adj[v].push(Math.floor(v / 2))
    adj[Math.floor(v / 2)].push(v)
  }
  return queries.map(([a, b]) => {
    const dist = new Map([[a, 0]])
    const queue = [a]
    for (let i = 0; i < queue.length; i++) {
      const u = queue[i]
      for (const w of adj[u]) if (!dist.has(w)) { dist.set(w, dist.get(u) + 1); queue.push(w) }
    }
    return dist.get(b) + 1
  })
}

test('2509 random queries match a breadth-first oracle', () => {
  let seed = 2509
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(3)
    const nodes = 2 ** n - 1
    const input = { n, queries: Array.from({ length: 1 + rnd(8) }, () => [1 + rnd(nodes), 1 + rnd(nodes)]) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
