import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Reference: for each water cell, the minimum Manhattan distance to any land cell (BFS-equivalent on a full grid).
function reference(grid) {
  const n = grid.length
  const land = []
  let water = 0
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) grid[r][c] === 1 ? land.push([r, c]) : water++
  if (!land.length || !water) return -1
  let best = 0
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (grid[r][c] === 1) continue
    best = Math.max(best, Math.min(...land.map(([lr, lc]) => Math.abs(lr - r) + Math.abs(lc - c))))
  }
  return best
}

test('sample grid with three land cells gives distance 2', () => {
  assert.equal(buildTrace(parseInput('[[1,0,1],[0,0,0],[1,0,0]]')).result, 2)
})

test('single corner land cell in a 2 by 2 grid', () => {
  assert.equal(buildTrace(parseInput('[[1,0],[0,0]]')).result, 2)
})

test('all water and all land give -1', () => {
  assert.equal(buildTrace(parseInput('[[0,0],[0,0]]')).result, -1)
  assert.equal(buildTrace(parseInput('[[1,1],[1,1]]')).result, -1)
})

test('matches the reference on random 6 by 6 grids', () => {
  let seed = 11
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(6)
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => rand(3) === 0 ? 1 : 0))
    assert.equal(buildTrace(grid).result, reference(grid), JSON.stringify(grid))
  }
})

test('invalid grids are rejected', () => {
  assert.throws(() => parseInput('[[1,0],[0]]'), /same length/)
  assert.throws(() => parseInput('[[2,0],[0,0]]'), /0 or 1/)
  assert.throws(() => parseInput('nope'), /JSON/)
})

test('frames finish with a done frame and valid code lines', () => {
  const run = buildTrace([[1, 0], [0, 0]])
  for (const frame of run.frames) assert.ok(frame.activeLine >= 1 && frame.activeLine <= 8)
  assert.equal(run.frames.at(-1).phase, 'done')
})
