import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2368 official examples', () => {
  assert.equal(solve({ n: 7, edges: [[0, 1], [1, 2], [3, 1], [4, 0], [0, 5], [5, 6]], restricted: [4, 5] }), 4)
  assert.equal(solve({ n: 7, edges: [[0, 1], [0, 2], [0, 5], [0, 4], [3, 2], [6, 5]], restricted: [4, 2, 1] }), 3)
})

test('2368 rejects a cycle and a restricted node 0', () => {
  assert.throws(() => parseInput(JSON.stringify({ n: 4, edges: [[0, 1], [1, 2], [2, 0]], restricted: [] })), /cycle/)
  assert.throws(() => parseInput(JSON.stringify({ n: 3, edges: [[0, 1], [1, 2]], restricted: [0] })))
})

// Independent oracle: union-find over the edges that avoid restricted nodes, then the size of node 0's set.
function oracle({ n, edges, restricted }) {
  const bad = new Set(restricted)
  const p = Array.from({ length: n }, (_, i) => i)
  const find = x => { while (p[x] !== x) x = p[x]; return x }
  for (const [a, b] of edges) if (!bad.has(a) && !bad.has(b)) p[find(a)] = find(b)
  let count = 0
  for (let v = 0; v < n; v++) if (!bad.has(v) && find(v) === find(0)) count++
  return count
}

test('2368 random trees match a union-find oracle', () => {
  let seed = 2368
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(9)
    const edges = []
    for (let i = 1; i < n; i++) edges.push([rnd(i), i])
    const restricted = []
    for (let v = 1; v < n; v++) if (rnd(3) === 0) restricted.push(v)
    const input = { n, edges, restricted }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
