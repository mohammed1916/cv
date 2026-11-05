import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (maze, entrance) => buildTrace(parseInput(JSON.stringify({ maze, entrance }))).result
// Bellman-Ford style relaxation over all cells, then the closest border cell: independent of the queue order.
const brute = (maze, [er, ec]) => {
  const m = maze.length, n = maze[0].length
  const d = Array.from({ length: m }, () => new Array(n).fill(Infinity))
  d[er][ec] = 0
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
      if (d[r][c] === Infinity || maze[r][c] !== '.') continue
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && maze[nr][nc] === '.' && d[r][c] + 1 < d[nr][nc]) { d[nr][nc] = d[r][c] + 1; changed = true }
      }
    }
  }
  let best = Infinity
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
    const isEntrance = r === er && c === ec
    const border = r === 0 || r === m - 1 || c === 0 || c === n - 1
    if (!isEntrance && border && d[r][c] !== Infinity) best = Math.min(best, d[r][c])
  }
  return best === Infinity ? -1 : best
}

test('1926 invented mazes', () => {
  assert.equal(solve(['+.+', '...', '+.+'], [1, 1]), 1)
  assert.equal(solve(['+++', '+.+', '+++'], [1, 1]), -1)
  assert.equal(solve(['+++', '.+.', '+++'], [1, 0]), -1)
  assert.equal(solve(['.+.', '.++', '...'], [0, 0]), 1)
})

test('1926 matches relaxation search', () => {
  const cases = [
    [['....', '.++.', '....', '.+..'], [1, 0]],
    [['..+', '.+.', '+..', '...'], [2, 1]],
    [['.....', '.+++.', '.+.+.', '.+++.', '.....'], [2, 2]],
    [['+.+', '.+.', '+.+'], [0, 1]],
  ]
  for (const [maze, entrance] of cases) {
    const got = solve(maze, entrance)
    const want = brute(maze, entrance)
    assert.equal(got, want, JSON.stringify([maze, entrance]))
  }
})
