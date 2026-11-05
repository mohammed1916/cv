import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (row, col, cells) => buildTrace(parseInput(JSON.stringify({ row, col, cells }))).result
// Linear scan from the last day downward: the first day with a land crossing is the answer.
const crosses = (row, col, cells, day) => {
  const water = Array.from({ length: row }, () => new Array(col).fill(false))
  cells.slice(0, day).forEach(([r, c]) => { water[r - 1][c - 1] = true })
  const seen = Array.from({ length: row }, () => new Array(col).fill(false))
  const stack = []
  for (let c = 0; c < col; c++) if (!water[0][c]) { seen[0][c] = true; stack.push([0, c]) }
  while (stack.length) {
    const [r, c] = stack.pop()
    if (r === row - 1) return true
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr >= 0 && nr < row && nc >= 0 && nc < col && !water[nr][nc] && !seen[nr][nc]) { seen[nr][nc] = true; stack.push([nr, nc]) }
    }
  }
  return false
}
const linear = (row, col, cells) => { let d = cells.length; while (d > 0 && !crosses(row, col, cells, d)) d--; return d }

test('1970 invented grids', () => {
  assert.equal(solve(2, 2, [[1, 1], [2, 1], [1, 2], [2, 2]]), 2)
  assert.equal(solve(3, 3, [[2, 2], [2, 1], [2, 3]]), 2)
})

test('1970 matches linear scan', () => {
  const cases = [
    [3, 3, [[2, 1], [2, 2], [2, 3], [1, 1], [3, 3]]],
    [4, 3, [[1, 2], [2, 2], [3, 2], [4, 1], [3, 3], [2, 3], [1, 1]]],
    [3, 4, [[1, 1], [2, 2], [3, 3], [1, 2], [2, 3]]],
  ]
  for (const [r, c, cells] of cases) assert.equal(solve(r, c, cells), linear(r, c, cells), JSON.stringify([r, c, cells]))
})
