import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = grid => buildTrace(grid).result

test('2814 walks around water when a route stays dry', () => {
  assert.equal(solve(['S...D', '.....', '*....']), 4)
  assert.equal(solve(['S*D']), -1)
  assert.equal(solve(['S..*', '.X..', '...D']), -1)
})

test('2814 the traveler is caught by water before it can leave', () => {
  assert.equal(solve(['S*.D']), -1)
  assert.equal(solve(['S.*D']), -1)
})

test('2814 the destination is never flooded and start may be adjacent', () => {
  assert.equal(solve(['SD']), 1)
  assert.equal(solve(['S.D']), 2)
})

test('2814 rejects malformed grids', () => {
  assert.throws(() => parseInput('["S.."]'))
  assert.throws(() => parseInput('["S.D", "S.."]'))
  assert.throws(() => parseInput('["S.Q"]'))
  assert.throws(() => parseInput('["S..", "D"]'))
})

// Independent oracle: simulate water minute by minute and track the set of cells the traveler can occupy.
function oracle(grid) {
  const R = grid.length, C = grid[0].length
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  const key = (r, c) => r * C + c
  let water = new Set()
  let pos = new Set()
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (grid[r][c] === '*') water.add(key(r, c))
    if (grid[r][c] === 'S') pos.add(key(r, c))
  }
  const dest = grid.flatMap((row, r) => [...row].map((ch, c) => (ch === 'D' ? key(r, c) : -1))).find(k => k >= 0)
  for (let minute = 1; minute <= R * C + 2; minute++) {
    const spread = new Set(water)
    for (const k of water) {
      const r = Math.floor(k / C), c = k % C
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc
        if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue
        if (grid[nr][nc] === 'X' || grid[nr][nc] === 'D') continue
        spread.add(key(nr, nc))
      }
    }
    water = spread
    const next = new Set()
    for (const k of pos) {
      if (water.has(k)) continue
      const r = Math.floor(k / C), c = k % C
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc
        if (nr < 0 || nc < 0 || nr >= R || nc >= C || grid[nr][nc] === 'X') continue
        if (!water.has(key(nr, nc))) next.add(key(nr, nc))
      }
    }
    pos = next
    if (pos.has(dest)) return minute
    if (pos.size === 0) return -1
  }
  return -1
}

test('2814 random small grids match a minute-by-minute oracle', () => {
  let seed = 2814
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const symbols = '..*X'
  for (let t = 0; t < 400; t++) {
    const R = 1 + rnd(4), C = 2 + rnd(4)
    const cells = Array.from({ length: R * C }, () => symbols[rnd(symbols.length)])
    const placeAt = rnd(R * C)
    cells[placeAt] = 'S'
    let dAt = rnd(R * C)
    if (dAt === placeAt) dAt = (placeAt + 1) % (R * C)
    cells[dAt] = 'D'
    const grid = Array.from({ length: R }, (_, r) => cells.slice(r * C, r * C + C).join(''))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})

test('2814 every frame points at real pseudocode and python lines', () => {
  const run = buildTrace(parseInput('["S..*", ".X..", "...D"]'))
  const pyLines = python.trim().split('\n').length
  assert.ok(run.frames.length > 3)
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.reached))
  }
})
