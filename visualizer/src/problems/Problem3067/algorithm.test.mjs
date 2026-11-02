import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (edges, signalSpeed) => buildTrace({ edges, signalSpeed }).result

test('3067 worked examples', () => {
  assert.deepEqual(solve([[0, 1, 1], [1, 2, 5], [2, 3, 13], [3, 4, 9], [4, 5, 2]], 1), [0, 4, 6, 6, 4, 0])
  assert.deepEqual(solve([[0, 6, 3], [6, 5, 3], [0, 3, 1], [3, 2, 7], [3, 1, 6], [3, 4, 2]], 3), [2, 0, 0, 0, 0, 0, 2])
})

test('3067 edge cases', () => {
  assert.deepEqual(solve([[0, 1, 2]], 2), [0, 0])
  assert.deepEqual(solve([[0, 1, 1]], 2), [0, 0])
  assert.throws(() => parseInput('{"edges":[[0,0,1]],"signalSpeed":1}'))
})

// Independent oracle: distances from every server; a pair counts when both paths from the
// chosen server are divisible and the pair's own path avoids that server.
function oracle(edges, signalSpeed) {
  const n = edges.length + 1
  const INF = Infinity
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)))
  for (const [a, b, w] of edges) { d[a][b] = w; d[b][a] = w }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  return Array.from({ length: n }, (_, c) => {
    let count = 0
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      if (a === c || b === c) continue
      if (d[c][a] % signalSpeed !== 0 || d[c][b] % signalSpeed !== 0) continue
      if (d[a][b] !== d[a][c] + d[c][b]) continue
      count++
    }
    return count
  })
}

test('3067 random trees match the distance oracle', () => {
  let seed = 3067
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(7)
    const edges = []
    for (let v = 1; v < n; v++) edges.push([rnd(v), v, 1 + rnd(9)])
    const speed = 1 + rnd(4)
    assert.deepEqual(solve(edges, speed), oracle(edges, speed), JSON.stringify({ edges, speed }))
  }
})
