import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = targetGrid => buildTrace({ targetGrid }).result

test('1591 worked examples', () => {
  assert.equal(solve([[1, 1, 1, 1], [1, 2, 2, 1], [1, 2, 2, 1], [1, 1, 1, 1]]), true)
  assert.equal(solve([[1, 1, 1, 1], [1, 1, 3, 3], [1, 1, 3, 4], [5, 5, 1, 4]]), true)
  assert.equal(solve([[1, 2, 1], [2, 1, 2], [1, 2, 1]]), false)
})

test('1591 rejects a colour outside 1 to 60', () => {
  assert.throws(() => parseInput('{"targetGrid":[[61]]}'))
})

// Oracle: try every painting order of the colours; each colour paints its full bounding box.
function oracle(grid) {
  const colors = [...new Set(grid.flat())]
  const bounds = new Map()
  grid.forEach((row, r) => row.forEach((c, col) => {
    const b = bounds.get(c) || { top: r, left: col, bottom: r, right: col }
    bounds.set(c, { top: Math.min(b.top, r), left: Math.min(b.left, col), bottom: Math.max(b.bottom, r), right: Math.max(b.right, col) })
  }))
  const permute = (items) => items.length <= 1 ? [items] : items.flatMap((x, i) => permute([...items.slice(0, i), ...items.slice(i + 1)]).map(rest => [x, ...rest]))
  return permute(colors).some(order => {
    const paint = grid.map(row => row.map(() => 0))
    for (const c of order) {
      const b = bounds.get(c)
      for (let r = b.top; r <= b.bottom; r++) for (let col = b.left; col <= b.right; col++) paint[r][col] = c
    }
    return paint.every((row, r) => row.every((v, col) => v === grid[r][col]))
  })
}

test('1591 small grids match a painting-order oracle', () => {
  let seed = 1591
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rnd(4), cols = 1 + rnd(4)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 1 + rnd(3)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
