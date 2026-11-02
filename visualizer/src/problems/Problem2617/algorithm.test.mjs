import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result
const fmt = grid => `[${grid.map(row => `[${row.join(', ')}]`).join(', ')}]`

function runPython(call) {
  const r = spawnSync('python3', ['-I', '-c', `${python}\nprint(${call})`], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout.trim()
}

// Brute force: breadth-first search where each move jumps right or down by at most the cell's value.
function bruteForce(grid) {
  const m = grid.length, n = grid[0].length
  const dist = Array.from({ length: m }, () => Array(n).fill(-1))
  dist[0][0] = 1
  const queue = [[0, 0]]
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head]
    const reach = []
    for (let k = 1; k <= grid[r][c]; k++) {
      if (c + k < n) reach.push([r, c + k])
      if (r + k < m) reach.push([r + k, c])
    }
    for (const [nr, nc] of reach) {
      if (dist[nr][nc] === -1) { dist[nr][nc] = dist[r][c] + 1; queue.push([nr, nc]) }
    }
  }
  return dist[m - 1][n - 1]
}

test('2617 worked examples', () => {
  assert.equal(solve([[3, 4, 2, 1], [4, 2, 3, 1], [2, 1, 0, 0], [2, 4, 0, 0]]), 4)
  assert.equal(solve([[3, 4, 2, 1], [4, 2, 1, 1], [2, 1, 1, 0], [3, 4, 1, 0]]), 3)
  assert.equal(solve([[2, 1, 0], [1, 0, 0]]), -1)
  assert.equal(solve([[0]]), 1)
})

test('2617 every frame points at an executable python line', () => {
  const lines = python.split('\n')
  for (const frame of buildTrace(parseInput('{"grid": [[2, 1, 0], [1, 0, 0]]}')).frames) {
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length)
    assert.ok(lines[frame.pythonLine - 1].trim().length > 0)
  }
})

test('2617 python export agrees with the trace', () => {
  for (const grid of [[[3, 4, 2, 1], [4, 2, 3, 1], [2, 1, 0, 0], [2, 4, 0, 0]], [[2, 1, 0], [1, 0, 0]], [[0]]]) {
    assert.equal(runPython(`minVisitedCells(${fmt(grid)})`), String(solve(grid)))
  }
})

test('2617 random grids match a breadth-first search oracle', () => {
  let seed = 2617
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % k }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(5), n = 1 + rnd(5)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(5)))
    assert.equal(solve(grid), bruteForce(grid), JSON.stringify(grid))
  }
})

test('2617 rejects a ragged grid', () => {
  assert.throws(() => parseInput('{"grid": [[1, 2], [1]]}'))
})
