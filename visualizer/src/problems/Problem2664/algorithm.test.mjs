import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]

function exists(rows, cols, start) {
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false))
  const total = rows * cols
  const dfs = (r, c, count) => {
    if (count === total) return true
    for (const [dr, dc] of KNIGHT) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || seen[nr][nc]) continue
      seen[nr][nc] = true
      if (dfs(nr, nc, count + 1)) return true
      seen[nr][nc] = false
    }
    return false
  }
  seen[start[0]][start[1]] = true
  return dfs(start[0], start[1], 1)
}

function assertValidTour(grid, rows, cols, start) {
  assert.equal(grid.length, rows)
  const cells = new Map()
  grid.forEach((row, r) => row.forEach((v, c) => cells.set(v, [r, c])))
  assert.equal(cells.size, rows * cols)
  assert.deepEqual(cells.get(0), start)
  for (let v = 1; v < rows * cols; v++) {
    const [a, b] = [cells.get(v - 1), cells.get(v)]
    const dr = Math.abs(a[0] - b[0]), dc = Math.abs(a[1] - b[1])
    assert.ok((dr === 1 && dc === 2) || (dr === 2 && dc === 1), `move ${v - 1} to ${v}`)
  }
}

test('2664 authored presets', () => {
  const big = buildTrace({ rows: 5, cols: 5, start: [0, 0] })
  assertValidTour(big.result, 5, 5, [0, 0])
  assertValidTour(buildTrace({ rows: 5, cols: 5, start: [2, 2] }).result, 5, 5, [2, 2])
  assert.deepEqual(buildTrace({ rows: 3, cols: 3, start: [1, 1] }).result, [])
  assert.deepEqual(buildTrace({ rows: 1, cols: 1, start: [0, 0] }).result, [[0]])
})

test('2664 input validation', () => {
  assert.throws(() => parseInput('{"rows":6,"cols":5,"start":[0,0]}'))
  assert.throws(() => parseInput('{"rows":3,"cols":3,"start":[3,0]}'))
  assert.throws(() => parseInput('{"rows":3,"cols":3,"start":[0]}'))
})

test('2664 small boards agree with an unordered existence search', () => {
  for (const [rows, cols] of [[1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [4, 4], [2, 4]]) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const result = buildTrace({ rows, cols, start: [r, c] }).result
        const expected = exists(rows, cols, [r, c])
        assert.equal(result.length > 0, expected, JSON.stringify({ rows, cols, start: [r, c] }))
        if (expected) assertValidTour(result, rows, cols, [r, c])
      }
    }
  }
})

test('2664 frames keep valid lines and the search stays within budget', () => {
  const pyLines = python.trim().split('\n').length
  const run = buildTrace({ rows: 4, cols: 4, start: [0, 0] })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(frame.board.length, 4)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
