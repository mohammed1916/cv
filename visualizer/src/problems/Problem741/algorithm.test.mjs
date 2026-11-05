import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Every pair of right/down paths that avoids thorns; the union of their cherries is the answer.
function paths(grid) {
  const n = grid.length, out = []
  const walk = (r, c, cells) => {
    if (grid[r][c] === -1) return
    const next = [...cells, [r, c]]
    if (r === n - 1 && c === n - 1) { out.push(next); return }
    if (r + 1 < n) walk(r + 1, c, next)
    if (c + 1 < n) walk(r, c + 1, next)
  }
  walk(0, 0, [])
  return out
}
function brute(grid) {
  const all = paths(grid)
  let best = 0
  for (const p of all) for (const q of all) {
    const seen = new Set()
    let total = 0
    for (const [r, c] of [...p, ...q]) { const key = r * 100 + c; if (!seen.has(key)) { seen.add(key); total += grid[r][c] === 1 ? 1 : 0 } }
    best = Math.max(best, total)
  }
  return best
}

test('741 worked examples', () => {
  assert.equal(buildTrace([[0, 1, -1], [1, 0, -1], [1, 1, 1]]).result, 5)
  assert.equal(buildTrace([[1, -1], [-1, 1]]).result, 0)
})

test('741 small grids match an exhaustive search over path pairs', () => {
  let state = 741
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(4)
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => [-1, 0, 1, 1][rand(4)]))
    assert.equal(buildTrace(grid).result, brute(grid), JSON.stringify(grid))
  }
})

test('741 rejects values outside -1, 0, 1', () => {
  assert.throws(() => parseInput('[[2]]'))
})
