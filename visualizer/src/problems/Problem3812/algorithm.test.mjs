import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

// Brute force: try every set of edges (each toggled at most once) and keep the smallest valid one.
function brute({ n, edges, start, target }) {
  let best = null
  for (let mask = 0; mask < 1 << edges.length; mask++) {
    const color = [...start].map(Number)
    const chosen = []
    edges.forEach(([a, b], idx) => {
      if (mask & (1 << idx)) { color[a] ^= 1; color[b] ^= 1; chosen.push(idx) }
    })
    if (color.join('') === target && (best === null || chosen.length < best.length)) best = chosen
  }
  return best === null ? [-1] : best
}

const trees = [
  { n: 4, edges: [[0, 1], [0, 2], [2, 3]] },
  { n: 5, edges: [[0, 1], [1, 2], [1, 3], [3, 4]] },
  { n: 6, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5]] },
]

test('3812 matches a brute force on small trees with feasible and infeasible targets', () => {
  for (const { n, edges } of trees) {
    for (let s = 0; s < 1 << n; s += 3) {
      for (let t = 0; t < 1 << n; t += 5) {
        const start = s.toString(2).padStart(n, '0')
        const target = t.toString(2).padStart(n, '0')
        assert.deepEqual(solve({ n, edges, start, target }), brute({ n, edges, start, target }), `${start} -> ${target}`)
      }
    }
  }
})

test('3812 an odd number of mismatches is impossible', () => {
  assert.deepEqual(solve({ n: 3, edges: [[1, 0], [2, 1]], start: '001', target: '110' }), [-1])
})

test('3812 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ n: 3, edges: [[0, 1], [1, 2]], start: '011', target: '111' }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3812 rejects a disconnected edge list', () => {
  assert.throws(() => parseInput('{"n":4,"edges":[[0,1],[2,3],[2,3]],"start":"0000","target":"0000"}'))
})
