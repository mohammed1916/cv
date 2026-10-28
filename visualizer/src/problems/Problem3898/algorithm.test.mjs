import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = matrix => buildTrace(parseInput(JSON.stringify({ matrix }))).result

test('3898 official examples', () => {
  assert.deepEqual(solve([[0, 1, 1], [1, 0, 1], [1, 1, 0]]), [2, 2, 2])
  assert.deepEqual(solve([[0, 1, 0], [1, 0, 0], [0, 0, 0]]), [1, 1, 0])
  assert.deepEqual(solve([[0]]), [0])
})

test('3898 an isolated vertex has degree zero', () => {
  assert.deepEqual(solve([[0, 0, 0], [0, 0, 0], [0, 0, 0]]), [0, 0, 0])
})

test('3898 rejects a non-symmetric matrix and a self-loop', () => {
  assert.throws(() => parseInput('{"matrix":[[0,1],[0,0]]}'), /symmetric/)
  assert.throws(() => parseInput('{"matrix":[[1]]}'), /Diagonal/)
})

// Independent oracle: read each edge once from the upper triangle and count its two endpoints.
function oracle(matrix) {
  const n = matrix.length
  const deg = Array(n).fill(0)
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (matrix[i][j] === 1) { deg[i]++; deg[j]++ }
  }
  return deg
}

test('3898 random symmetric matrices match an edge-list oracle', () => {
  let seed = 3898
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const m = Array.from({ length: n }, () => Array(n).fill(0))
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const v = rnd(2)
      m[i][j] = v
      m[j][i] = v
    }
    assert.deepEqual(solve(m), oracle(m), JSON.stringify(m))
  }
})
