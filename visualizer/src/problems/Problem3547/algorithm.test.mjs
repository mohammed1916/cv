import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3547 official examples', () => {
  assert.equal(solve({ n: 4, edges: [[0, 1], [1, 2], [2, 3]] }), 23)
  assert.equal(solve({ n: 6, edges: [[0, 3], [4, 5], [2, 0], [1, 3], [2, 4], [1, 5]] }), 82)
})

test('3547 a single edge gets the two smallest values', () => {
  assert.equal(solve({ n: 2, edges: [[0, 1]] }), 2)
})

test('3547 rejects a node with three neighbours', () => {
  assert.throws(() => parseInput('{"n":4,"edges":[[0,1],[0,2],[0,3]]}'), /at most two/)
})

// Independent oracle: try every assignment of the values 1..n to the nodes and keep the best edge sum.
function oracle({ n, edges }) {
  let best = -Infinity
  const used = Array(n + 1).fill(false)
  const val = Array(n).fill(0)
  const place = v => {
    if (v === n) {
      let sum = 0
      for (const [a, b] of edges) sum += val[a] * val[b]
      best = Math.max(best, sum)
      return
    }
    for (let x = 1; x <= n; x++) {
      if (used[x]) continue
      used[x] = true
      val[v] = x
      place(v + 1)
      used[x] = false
    }
  }
  place(0)
  return best
}

test('3547 random paths and cycles match an every-assignment oracle', () => {
  let seed = 3547
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 120; trial++) {
    const n = 2 + rnd(6)
    const perm = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [perm[i], perm[j]] = [perm[j], perm[i]] }
    const edges = []
    for (let i = 0; i + 1 < n; i++) edges.push([perm[i], perm[i + 1]])
    if (n >= 3 && rnd(2) === 0) edges.push([perm[n - 1], perm[0]])
    const input = { n, edges }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
