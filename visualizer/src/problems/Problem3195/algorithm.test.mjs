import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3195 official examples', () => {
  assert.equal(solve('[[0,1,0],[1,0,1]]'), 6)
  assert.equal(solve('[[1,0],[0,0]]'), 1)
  assert.equal(solve('[[1,0,0,0,1],[0,0,0,0,0],[0,0,1,0,0]]'), 15)
})

test('3195 a single 1 covers an area of one', () => {
  assert.equal(solve('[[0,0],[0,1]]'), 1)
})

test('3195 rejects an empty grid of zeros', () => {
  assert.throws(() => parseInput('[[0,0],[0,0]]'))
})

// Independent oracle: try every rectangle and keep the smallest one that contains every 1.
function oracle(grid) {
  const R = grid.length, C = grid[0].length
  let best = Infinity
  for (let r1 = 0; r1 < R; r1++) for (let r2 = r1; r2 < R; r2++) for (let c1 = 0; c1 < C; c1++) for (let c2 = c1; c2 < C; c2++) {
    let ok = true
    for (let r = 0; r < R && ok; r++) for (let c = 0; c < C && ok; c++) {
      if (grid[r][c] === 1 && !(r >= r1 && r <= r2 && c >= c1 && c <= c2)) ok = false
    }
    if (ok) best = Math.min(best, (r2 - r1 + 1) * (c2 - c1 + 1))
  }
  return best
}

test('3195 random grids match a rectangle search', () => {
  let seed = 3195
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const R = 1 + rnd(5), C = 1 + rnd(5)
    const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (rnd(4) === 0 ? 1 : 0)))
    if (!grid.some(row => row.includes(1))) grid[0][0] = 1
    assert.equal(solve(JSON.stringify(grid)), oracle(grid), JSON.stringify(grid))
  }
})
