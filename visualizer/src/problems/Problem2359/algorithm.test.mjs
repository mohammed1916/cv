import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (edges, first, second) => buildTrace({ edges, first, second }).result

test('2359 official examples', () => {
  assert.equal(solve([2, 2, 3, -1], 0, 1), 2)
  assert.equal(solve([1, 2, -1], 0, 2), 2)
})

test('2359 edge cases: no shared node, and identical starts', () => {
  assert.equal(solve([1, -1, -1], 0, 2), -1)
  assert.equal(solve([1, 2, -1], 1, 1), 1)
})

test('2359 rejects an edge that points outside the array', () => {
  assert.throws(() => parseInput('{"edges":[1,5],"first":0,"second":1}'))
})

// Independent oracle: breadth-first search from each start over the directed edges, then compare distances.
function bfsDistances(edges, start) {
  const dist = Array(edges.length).fill(-1)
  dist[start] = 0
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head]
    const next = edges[cur]
    if (next !== -1 && dist[next] === -1) {
      dist[next] = dist[cur] + 1
      queue.push(next)
    }
  }
  return dist
}

function oracle(edges, first, second) {
  const a = bfsDistances(edges, first)
  const b = bfsDistances(edges, second)
  let best = -1
  let bestWorst = Infinity
  edges.forEach((_, node) => {
    if (a[node] < 0 || b[node] < 0) return
    const worst = Math.max(a[node], b[node])
    if (worst < bestWorst) {
      bestWorst = worst
      best = node
    }
  })
  return best
}

test('2359 random graphs match a breadth-first oracle', () => {
  let seed = 2359
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(7)
    const edges = Array.from({ length: n }, () => (rnd(4) === 0 ? -1 : rnd(n)))
    const first = rnd(n)
    const second = rnd(n)
    assert.equal(solve(edges, first, second), oracle(edges, first, second), JSON.stringify({ edges, first, second }))
  }
})
