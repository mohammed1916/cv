import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('2258 worked examples', () => {
  assert.equal(solve([[0, 2, 0, 0, 0, 0, 0], [0, 0, 0, 2, 2, 1, 0], [0, 2, 0, 0, 1, 2, 0], [0, 0, 2, 2, 2, 0, 2], [0, 0, 0, 0, 0, 0, 0]]), 3)
  assert.equal(solve([[0, 0, 0, 0], [0, 1, 2, 0], [0, 2, 0, 0]]), -1)
  assert.equal(solve([[0, 0, 0], [2, 2, 0], [1, 2, 0]]), 1000000000)
})

test('2258 edge cases', () => {
  assert.equal(solve([[0, 0], [0, 0]]), 1000000000)
  assert.equal(solve([[0, 1], [1, 0]]), -1)
  assert.equal(solve([[0, 0, 0], [0, 2, 0], [0, 0, 0]]), 1000000000)
})

test('2258 rejects bad cells and a burning start or safehouse', () => {
  assert.throws(() => parseInput('{"grid":[[0,3],[0,0]]}'))
  assert.throws(() => parseInput('{"grid":[[1,0],[0,0]]}'))
  assert.throws(() => parseInput('{"grid":[[0,0],[0,1]]}'))
})

test('2258 frames point at executable python lines', () => {
  const lines = python.split('\n').length
  const { frames } = buildTrace({ grid: [[0, 0], [1, 0]] })
  for (const frame of frames) {
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= lines, JSON.stringify(frame))
  }
})

// Independent oracle: simulate the fire minute by minute, then search over
// (cell, minute) states for each possible wait.
function oracle(grid) {
  const m = grid.length
  const n = grid[0].length
  const moves = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  const LAST = m * n + 1 // the fire is stable after this minute
  const burning = [] // burning[k] is a grid of booleans: burning at minute k
  let current = grid.map(row => row.map(v => v === 1))
  for (let k = 0; k <= LAST; k++) {
    burning.push(current)
    const next = current.map(row => row.slice())
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
      if (!current[r][c]) continue
      for (const [dr, dc] of moves) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === 0) next[nr][nc] = true
      }
    }
    current = next
  }
  const at = (k, r, c) => burning[Math.min(k, LAST)][r][c]
  const reachable = wait => {
    if (at(wait, 0, 0)) return false
    let frontier = new Set(['0,0'])
    for (let minute = wait; minute < wait + 2 * m * n + 4; minute++) {
      if (frontier.size === 0) return false
      const next = new Set()
      for (const key of frontier) {
        const [r, c] = key.split(',').map(Number)
        for (const [dr, dc] of moves) {
          const nr = r + dr, nc = c + dc
          if (nr < 0 || nr >= m || nc < 0 || nc >= n || grid[nr][nc] === 2) continue
          const arrive = minute + 1
          if (nr === m - 1 && nc === n - 1) {
            if (!at(arrive - 1, nr, nc)) return true
          } else if (!at(arrive, nr, nc)) {
            next.add(`${nr},${nc}`)
          }
        }
      }
      frontier = next
    }
    return false
  }
  if (!reachable(0)) return -1
  if (reachable(LAST + 1)) return 1000000000
  let best = 0
  for (let t = 0; t <= LAST; t++) if (reachable(t)) best = t
  return best
}

test('2258 random grids match a minute-by-minute oracle', () => {
  let seed = 2258
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 2 + rnd(3)
    const n = 2 + rnd(3)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => [0, 0, 0, 1, 2][rnd(5)]))
    grid[0][0] = 0
    grid[m - 1][n - 1] = 0
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
