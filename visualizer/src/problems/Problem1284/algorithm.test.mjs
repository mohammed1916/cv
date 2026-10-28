import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = mat => buildTrace(mat).result

test('1284 official examples', () => {
  assert.equal(solve([[0, 0], [0, 1]]), 3)
  assert.equal(solve([[0]]), 0)
  assert.equal(solve([[1, 0, 0], [1, 0, 1], [1, 0, 0]]), 6)
})

test('1284 rejects a value other than 0 or 1 and a matrix that is too large', () => {
  assert.throws(() => parseInput('[[2]]'))
  assert.throws(() => parseInput('[[0,0,0,0]]'))
})

// Independent oracle: try every subset of cells as the set of flips and keep the smallest that clears the matrix.
function oracle(mat) {
  const m = mat.length, n = mat[0].length, cells = m * n
  const flip = (grid, r, c) => {
    for (const [dr, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const rr = r + dr, cc = c + dc
      if (rr >= 0 && rr < m && cc >= 0 && cc < n) grid[rr][cc] ^= 1
    }
  }
  let best = -1
  for (let s = 0; s < (1 << cells); s++) {
    const grid = mat.map(row => [...row])
    let count = 0
    for (let k = 0; k < cells; k++) {
      if ((s >> k) & 1) { count++; flip(grid, Math.floor(k / n), k % n) }
    }
    if (grid.every(row => row.every(v => v === 0)) && (best === -1 || count < best)) best = count
  }
  return best
}

test('1284 random matrices match a subset-enumeration oracle', () => {
  let seed = 1284
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(3), n = 1 + rnd(3)
    const mat = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(2)))
    assert.equal(solve(mat), oracle(mat), JSON.stringify(mat))
  }
})
