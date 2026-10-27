import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: for each node i, count nodes j with the same label whose upward walk reaches i.
function oracle({ n, edges, labels }) {
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a) })
  const parent = Array(n).fill(-1)
  const seen = Array(n).fill(false)
  seen[0] = true
  const queue = [0]
  for (let q = 0; q < queue.length; q++) {
    for (const c of adj[queue[q]]) if (!seen[c]) { seen[c] = true; parent[c] = queue[q]; queue.push(c) }
  }
  return Array.from({ length: n }, (_, i) => {
    let count = 0
    for (let j = 0; j < n; j++) {
      if (labels[j] !== labels[i]) continue
      for (let up = j; up !== -1; up = parent[up]) {
        if (up === i) { count++; break }
      }
    }
    return count
  })
}

test('1519 official-style example', () => {
  assert.deepEqual(solve({ n: 7, edges: [[0, 1], [0, 2], [1, 4], [1, 5], [2, 3], [2, 6]], labels: 'abaedcd' }), [2, 1, 1, 1, 1, 1, 1])
})

test('1519 a star of equal labels', () => {
  assert.deepEqual(solve({ n: 4, edges: [[0, 1], [0, 2], [0, 3]], labels: 'aaaa' }), [4, 1, 1, 1])
})

test('1519 rejects labels of the wrong length', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1]],"labels":"a"}'))
})

test('1519 random trees match an ancestor-walk oracle', () => {
  let seed = 1519
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(11)
    const edges = []
    for (let i = 1; i < n; i++) {
      const parent = rnd(i)
      edges.push(rnd(2) ? [parent, i] : [i, parent])
    }
    const labels = Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
    const input = { n, edges, labels }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
