import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: enumerate every simple walk from the start with an explicit stack of partial walks,
// then keep the walks that end on the target and cover every open square (bitmask of visited squares).
function maskCount(grid) {
  const rows = grid.length, cols = grid[0].length
  const id = (r, c) => r * cols + c
  let all = 0, start = -1, end = -1
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const v = grid[r][c]
    if (v !== -1) all |= 1 << id(r, c)
    if (v === 1) start = id(r, c)
    if (v === 2) end = id(r, c)
  }
  let total = 0
  const pending = [[start, 1 << start]]
  while (pending.length) {
    const [cell, mask] = pending.pop()
    if (cell === end) {
      if (mask === all) total++
      continue
    }
    const r = Math.floor(cell / cols), c = cell % cols
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] === -1) continue
      const next = id(nr, nc)
      if (mask & (1 << next)) continue
      pending.push([next, mask | (1 << next)])
    }
  }
  return total
}

test('980 counts walks that cover every empty square', () => {
  const cases = [
    [[1, 0, 2]],
    [[1, 0], [0, 2]],
    [[1, -1], [0, 2]],
    [[1, 0, 0], [0, -1, 0], [0, 0, 2]],
    [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 2]],
    [[0, 1], [2, 0]],
    [[1, 0, -1], [0, 0, 0], [0, 2, 0]],
  ]
  for (const grid of cases) {
    const got = buildTrace(parseInput(JSON.stringify({ grid }))).result
    assert.equal(got, maskCount(grid), JSON.stringify(grid))
  }
})

test('980 matches the oracle on generated grids', () => {
  let seed = 7
  const next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 }
  for (let trial = 0; trial < 40; trial++) {
    const rows = 2 + Math.floor(next() * 2), cols = 2 + Math.floor(next() * 3)
    const cells = Array.from({ length: rows * cols }, () => (next() < 0.15 ? -1 : 0))
    const open = cells.map((v, i) => i).filter(i => cells[i] === 0)
    if (open.length < 2) continue
    cells[open[0]] = 1
    cells[open[open.length - 1]] = 2
    const grid = Array.from({ length: rows }, (_, r) => cells.slice(r * cols, r * cols + cols))
    const got = buildTrace(parseInput(JSON.stringify({ grid }))).result
    assert.equal(got, maskCount(grid), JSON.stringify(grid))
  }
})
