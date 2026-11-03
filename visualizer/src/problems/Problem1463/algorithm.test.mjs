import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

// Independent oracle: try every pair of paths by recursion, counting a shared cell once.
function brute(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const gain = (r, a, b) => grid[r][a] + (a === b ? 0 : grid[r][b])
  const rec = (r, a, b) => {
    if (r === rows - 1) return gain(r, a, b)
    let best = -Infinity
    for (let da = -1; da <= 1; da++) {
      for (let db = -1; db <= 1; db++) {
        const na = a + da
        const nb = b + db
        if (na >= 0 && na < cols && nb >= 0 && nb < cols) best = Math.max(best, rec(r + 1, na, nb))
      }
    }
    return gain(r, a, b) + best
  }
  return rec(0, 0, cols - 1)
}

test('1463 sample grids give the expected totals', () => {
  assert.equal(solve([[1, 2], [3, 4]]), 10)
  assert.equal(solve([[5, 6, 7]]), 12)
  assert.equal(solve([[0, 0], [0, 0]]), 0)
})

test('1463 random grids match exhaustive search', () => {
  let seed = 17
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(4)
    const cols = 2 + rnd(3)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(10)))
    assert.equal(solve(grid), brute(grid), JSON.stringify(grid))
  }
})

test('1463 rejects malformed input', () => {
  assert.throws(() => parseInput('[[1]]'), /2 to 8 integers/)
  assert.throws(() => parseInput('[[1,2],[3]]'), /same 2 to 8/)
  assert.throws(() => parseInput('[[1,101]]'), /0 to 100/)
})

test('1463 every frame points at a real phase and code line', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const frame of buildTrace({ grid: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }).frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})
