import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = grid => buildTrace(grid).result

test('2852 worked grids', () => {
  assert.equal(solve([[1, -1], [-1, 3]]), 4)
  assert.equal(solve([[1, 2], [3, 4]]), 0)
  assert.equal(solve([[-1]]), 0)
})

test('2852 a zero-value cell still counts as a cell', () => {
  assert.equal(solve([[0, -1, 5]]), 0 * 1 + 1 * 5)
})

test('2852 rejects malformed input', () => {
  assert.throws(() => parseInput('[[1,2],[3]]'))
  assert.throws(() => parseInput('[[10]]'))
  assert.throws(() => parseInput('[[-2]]'))
})

// Oracle: from every unblocked cell, BFS for reachable cells and add the values of the unreachable ones directly.
function oracle(grid) {
  const R = grid.length, C = grid[0].length
  const cells = []
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c] !== -1) cells.push([r, c])
  let answer = 0
  for (const [sr, sc] of cells) {
    const seen = new Set([`${sr},${sc}`])
    const queue = [[sr, sc]]
    while (queue.length) {
      const [x, y] = queue.shift()
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy
        if (nx < 0 || ny < 0 || nx >= R || ny >= C || grid[nx][ny] === -1 || seen.has(`${nx},${ny}`)) continue
        seen.add(`${nx},${ny}`)
        queue.push([nx, ny])
      }
    }
    for (const [r, c] of cells) if (!seen.has(`${r},${c}`)) answer += grid[r][c]
  }
  return answer
}

test('2852 random grids match a reachability oracle', () => {
  let seed = 2852
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const R = 1 + rnd(4), C = 1 + rnd(4)
    const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (rnd(4) === 0 ? -1 : rnd(10))))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})

test('2852 every frame points at real pseudocode and python lines', () => {
  const run = buildTrace([[2, -1, 1], [-1, 4, 0], [3, 0, -1]])
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
    assert.equal(f.label.length, 3)
  }
})
