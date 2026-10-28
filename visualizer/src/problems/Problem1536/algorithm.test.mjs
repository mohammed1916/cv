import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('1536 official examples', () => {
  assert.equal(solve({ grid: [[0, 0, 1], [1, 1, 0], [1, 0, 0]] }), 3)
  assert.equal(solve({ grid: [[0, 1, 1, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 1, 1, 0]] }), -1)
  assert.equal(solve({ grid: [[1, 0, 0], [1, 1, 0], [1, 1, 1]] }), 0)
})

test('1536 a single cell is already valid', () => {
  assert.equal(solve({ grid: [[1]] }), 0)
})

test('1536 rejects a non-square grid', () => {
  assert.throws(() => parseInput('{"grid":[[0,1],[1]]}'))
})

// Independent oracle: try every row order, keep the valid ones, and count swaps as inversions of that order.
function oracle({ grid }) {
  const n = grid.length
  const zeros = grid.map(row => {
    let c = 0
    for (let j = n - 1; j >= 0 && row[j] === 0; j--) c++
    return c
  })
  let best = -1
  const perm = []
  const used = Array(n).fill(false)
  const permute = () => {
    if (perm.length === n) {
      if (!perm.every((row, pos) => zeros[row] >= n - 1 - pos)) return
      let inversions = 0
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (perm[a] > perm[b]) inversions++
      if (best === -1 || inversions < best) best = inversions
      return
    }
    for (let r = 0; r < n; r++) {
      if (used[r]) continue
      used[r] = true
      perm.push(r)
      permute()
      perm.pop()
      used[r] = false
    }
  }
  permute()
  return best
}

test('1536 random grids match a permutation oracle', () => {
  let seed = 1536
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => (rnd(3) === 0 ? 1 : 0)))
    assert.equal(solve({ grid }), oracle({ grid }), JSON.stringify(grid))
  }
})
