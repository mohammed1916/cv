import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, edges) => buildTrace(parseInput(JSON.stringify({ nums, edges }))).result

test('2322 worked examples', () => {
  // Path 1 - 2 - 3: cutting both edges gives parts 1, 2 and 3 with xors 1, 2, 3, so the score is 3 - 1 = 2.
  assert.equal(solve([1, 2, 3], [[0, 1], [1, 2]]), 2)
  // Star with centre 0: every cut isolates a leaf, so the parts are two leaves (4, 4) and the rest (4 xor 4 = 0).
  assert.equal(solve([4, 4, 4, 4], [[0, 1], [0, 2], [0, 3]]), 4)
})

test('2322 rejects a cycle and a wrong edge count', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"edges":[[0,1],[1,0]]}'))
  assert.throws(() => parseInput('{"nums":[1,2,3],"edges":[[0,1]]}'))
})

// Independent oracle: remove each pair of edges, find the three components by union-find, and xor each one.
function oracle(nums, edges) {
  let best = Infinity
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const parent = nums.map((_, k) => k)
      const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
      edges.forEach(([a, b], e) => { if (e !== i && e !== j) parent[find(a)] = find(b) })
      const xor = new Map()
      nums.forEach((v, k) => { const r = find(k); xor.set(r, (xor.get(r) || 0) ^ v) })
      const vals = [...xor.values()]
      best = Math.min(best, Math.max(...vals) - Math.min(...vals))
    }
  }
  return best
}

test('2322 random trees match a remove-two-edges oracle', () => {
  let seed = 2322
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 3 + rnd(8)
    const perm = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [perm[i], perm[j]] = [perm[j], perm[i]] }
    const edges = []
    for (let k = 1; k < n; k++) edges.push([perm[k], perm[rnd(k)]])
    const nums = Array.from({ length: n }, () => 1 + rnd(50))
    assert.equal(solve(nums, edges), oracle(nums, edges), JSON.stringify({ nums, edges }))
  }
})
