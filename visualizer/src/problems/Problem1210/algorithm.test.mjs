import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('1210 official examples', () => {
  assert.equal(solve([
    [0, 0, 0, 0, 0, 1], [1, 1, 0, 0, 1, 0], [0, 0, 1, 0, 1, 0],
    [1, 1, 0, 0, 0, 1], [1, 1, 1, 0, 0, 1], [1, 1, 1, 0, 0, 0],
  ]), 11)
  assert.equal(solve([
    [0, 0, 1, 1, 1, 1], [0, 0, 0, 0, 1, 1], [1, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 1], [1, 1, 1, 0, 0, 0], [1, 1, 1, 0, 0, 0],
  ]), 9)
})

test('1210 a 2 by 2 open board needs one rotation-free slide', () => {
  // The snake is already one slide from the bottom right corner in the 2 by 2 board: one move down.
  assert.equal(solve([[0, 0], [0, 0]]), 1)
})

test('1210 rejects a blocked target cell', () => {
  assert.throws(() => parseInput('{"grid":[[0,0],[0,1]]}'))
})

// Independent oracle: model each snake as its set of two cells and relax distances until nothing improves.
function oracle(grid) {
  const n = grid.length
  const free = (r, c) => r >= 0 && c >= 0 && r < n && c < n && grid[r][c] === 0
  const key = cells => cells.map(([r, c]) => `${r},${c}`).sort().join('|')
  const successors = cells => {
    const out = []
    const shift = (dr, dc) => {
      const moved = cells.map(([r, c]) => [r + dr, c + dc])
      if (moved.every(([r, c]) => free(r, c))) out.push(moved)
    }
    shift(0, 1)
    shift(1, 0)
    const sameRow = cells[0][0] === cells[1][0]
    const [[r, c]] = [cells.reduce((a, b) => (a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]) ? a : b))]
    if (sameRow) {
      if (free(r + 1, c) && free(r + 1, c + 1)) out.push([[r, c], [r + 1, c]])
    } else if (free(r, c + 1) && free(r + 1, c + 1)) {
      out.push([[r, c], [r, c + 1]])
    }
    return out
  }
  const start = [[0, 0], [0, 1]]
  const target = key([[n - 1, n - 2], [n - 1, n - 1]])
  const dist = new Map([[key(start), 0]])
  const cellsOf = new Map([[key(start), start]])
  let changed = true
  while (changed) {
    changed = false
    for (const [k, cells] of [...cellsOf]) {
      const d = dist.get(k)
      for (const next of successors(cells)) {
        const nk = key(next)
        if (!dist.has(nk) || d + 1 < dist.get(nk)) {
          dist.set(nk, d + 1)
          cellsOf.set(nk, next)
          changed = true
        }
      }
    }
  }
  return dist.has(target) ? dist.get(target) : -1
}

test('1210 random boards match a geometric relaxation oracle', () => {
  let seed = 1210
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(4)
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => (rnd(4) === 0 ? 1 : 0)))
    grid[0][0] = 0
    grid[0][1] = 0
    grid[n - 1][n - 2] = 0
    grid[n - 1][n - 1] = 0
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
