import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (edges1, edges2) => buildTrace({ edges1, edges2 }).result

test('3203 worked examples', () => {
  // Joining the end of a single edge to the middle of a path of length 2 gives a path of length 3.
  assert.equal(solve([[0, 1]], [[0, 1], [1, 2]]), 3)
  // A single node joined to one end of an edge gives a path of length 2.
  assert.equal(solve([], [[0, 1]]), 2)
  assert.equal(solve([[0, 1]], [[0, 1]]), 3)
})

test('3203 the larger original diameter can win', () => {
  // A long path of length 4 stays longer than any join with a single edge.
  assert.equal(solve([[0, 1], [1, 2], [2, 3], [3, 4]], []), 4)
})

test('3203 rejects a cycle in either tree', () => {
  assert.throws(() => parseInput('{"edges1":[[0,1],[1,0]],"edges2":[]}'))
})

// Independent oracle: join every node of the first tree to every node of the second, then measure the diameter by BFS from every node.
function oracle(edges1, edges2) {
  const n1 = edges1.length + 1
  const n2 = edges2.length + 1
  let best = Infinity
  for (let u = 0; u < n1; u++) {
    for (let v = 0; v < n2; v++) {
      const n = n1 + n2
      const adjacency = Array.from({ length: n }, () => [])
      const add = (a, b) => { adjacency[a].push(b); adjacency[b].push(a) }
      for (const [a, b] of edges1) add(a, b)
      for (const [a, b] of edges2) add(a + n1, b + n1)
      add(u, v + n1)
      let diameter = 0
      for (let s = 0; s < n; s++) {
        const dist = Array(n).fill(-1)
        dist[s] = 0
        const queue = [s]
        for (let q = 0; q < queue.length; q++) {
          for (const w of adjacency[queue[q]]) if (dist[w] === -1) { dist[w] = dist[queue[q]] + 1; queue.push(w) }
        }
        diameter = Math.max(diameter, ...dist)
      }
      best = Math.min(best, diameter)
    }
  }
  return best
}

test('3203 random tree pairs match a brute-force join oracle', () => {
  let seed = 3203
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const randomTree = size => { const edges = []; for (let i = 1; i < size; i++) edges.push([i, rnd(i)]); return edges }
  for (let t = 0; t < 200; t++) {
    const edges1 = randomTree(1 + rnd(5))
    const edges2 = randomTree(1 + rnd(5))
    assert.equal(solve(edges1, edges2), oracle(edges1, edges2), JSON.stringify({ edges1, edges2 }))
  }
})
