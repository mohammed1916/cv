import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges) => buildTrace({ n, edges }).result

test('2867 worked examples', () => {
  assert.equal(solve(5, [[1, 2], [1, 3], [2, 4], [2, 5]]), 4)
  assert.equal(solve(3, [[1, 2], [2, 3]]), 1)
  assert.equal(solve(1, []), 0)
})

test('2867 a path with two primes is not counted', () => {
  // Label 2 alone is prime on the path 1-2, so that pair counts.
  assert.equal(solve(2, [[1, 2]]), 1)
  // Paths 2-3 and 1-2-3 each hold two primes, so only 1-2 counts.
  assert.equal(solve(3, [[2, 3], [1, 2]]), 1)
})

test('2867 rejects a cycle and an out-of-range label', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[1,2],[1,2]]}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[1,3]]}'))
})

// Independent oracle: breadth-first parents from each start, then count primes on the walked-back path.
function oracle(n, edges) {
  const adjacency = Array.from({ length: n + 1 }, () => [])
  for (const [a, b] of edges) { adjacency[a].push(b); adjacency[b].push(a) }
  const primeTable = [false, false, true, true, false, true, false, true, false, false, false, true, false]
  const isP = x => (x < primeTable.length ? primeTable[x] : [...Array(x).keys()].slice(2).every(d => x % d !== 0))
  let count = 0
  for (let u = 1; u <= n; u++) {
    const parent = Array(n + 1).fill(-1)
    parent[u] = 0
    const queue = [u]
    for (let q = 0; q < queue.length; q++) {
      for (const w of adjacency[queue[q]]) if (parent[w] === -1 && w !== u) { parent[w] = queue[q]; queue.push(w) }
    }
    for (let v = u + 1; v <= n; v++) {
      let primes = 0
      for (let x = v; x !== 0; x = parent[x]) if (isP(x)) primes++
      if (primes === 1) count++
    }
  }
  return count
}

test('2867 random trees match a BFS-path oracle', () => {
  let seed = 2867
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(9)
    const edges = []
    for (let i = 2; i <= n; i++) edges.push([i, 1 + rnd(i - 1)])
    assert.equal(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
