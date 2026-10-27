import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3197 official examples', () => {
  assert.equal(solve('[[1,0,1],[1,1,1]]'), 5)
  // Row 0 boxed over columns 0 to 2 (area 3), plus single cells at (1, 1) and (1, 3): 3 + 1 + 1 = 5.
  assert.equal(solve('[[1,0,1,0],[0,1,0,1]]'), 5)
})

test('3197 three separate ones each cost one', () => {
  assert.equal(solve('[[1,0,0],[0,1,0],[0,0,1]]'), 3)
})

test('3197 rejects a grid with fewer than three 1s', () => {
  assert.throws(() => parseInput('[[1,0],[0,0]]'))
})

// Independent oracle: try every triple of non-overlapping rectangles that each hold a 1 and cover all 1s.
function oracle(grid) {
  const R = grid.length, C = grid[0].length
  const rects = []
  for (let r1 = 0; r1 < R; r1++) for (let r2 = r1 + 1; r2 <= R; r2++) for (let c1 = 0; c1 < C; c1++) for (let c2 = c1 + 1; c2 <= C; c2++) {
    let ones = 0
    for (let r = r1; r < r2; r++) for (let c = c1; c < c2; c++) if (grid[r][c] === 1) ones++
    if (ones > 0) rects.push({ r1, r2, c1, c2, area: (r2 - r1) * (c2 - c1) })
  }
  const overlap = (a, b) => a.r1 < b.r2 && b.r1 < a.r2 && a.c1 < b.c2 && b.c1 < a.c2
  const covers = (rs) => {
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (grid[r][c] === 1 && !rs.some(q => r >= q.r1 && r < q.r2 && c >= q.c1 && c < q.c2)) return false
    }
    return true
  }
  let best = Infinity
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    if (overlap(rects[i], rects[j])) continue
    for (let k = j + 1; k < rects.length; k++) {
      if (overlap(rects[i], rects[k]) || overlap(rects[j], rects[k])) continue
      const trio = [rects[i], rects[j], rects[k]]
      if (covers(trio)) best = Math.min(best, trio.reduce((s, q) => s + q.area, 0))
    }
  }
  return best
}

test('3197 random grids match a triple-of-rectangles search', () => {
  let seed = 3197
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 60; t++) {
    const R = 2 + rnd(2), C = 2 + rnd(2)
    const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (rnd(2) === 0 ? 1 : 0)))
    if (grid.flat().filter(v => v === 1).length < 3) continue
    assert.equal(solve(JSON.stringify(grid)), oracle(grid), JSON.stringify(grid))
  }
})
