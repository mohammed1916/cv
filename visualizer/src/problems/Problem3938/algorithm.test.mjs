import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `pseudocode ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `python ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).shared, run.result)
}

test('3938 hand-checked 2 by 2 grid', () => {
  // Down-then-right and right-then-up share the bottom-left and bottom-right cells: 3 + 4.
  assert.equal(solve([[1, 2], [3, 4]]), 7)
})

test('3938 frames are complete for the presets', () => {
  assertFrames(buildTrace({ grid: [[1, -2, 3, 0], [4, 5, -6, 2], [-1, 7, 8, 1]] }))
  assertFrames(buildTrace({ grid: [[-1, 4, 2], [3, -5, 6]] }))
})

test('3938 rejects bad input', () => {
  assert.throws(() => parseInput('[[1]]'))
  assert.throws(() => parseInput('[[1,2],[3]]'))
  assert.throws(() => parseInput('[[1,101],[2,3]]'))
})

// Oracle: enumerate every right/down path for A and every right/up path for B.
function allPaths(rows, cols, from, to, dirs) {
  const out = []
  const walk = (r, c, cells) => {
    if (r === to[0] && c === to[1]) { out.push(cells); return }
    for (const [dr, dc] of dirs) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
      walk(nr, nc, [...cells, [nr, nc]])
    }
  }
  walk(from[0], from[1], [from])
  return out
}

function oracle(grid) {
  const n = grid.length
  const m = grid[0].length
  const A = allPaths(n, m, [0, 0], [n - 1, m - 1], [[1, 0], [0, 1]])
  const B = allPaths(n, m, [n - 1, 0], [0, m - 1], [[-1, 0], [0, 1]])
  let best = -Infinity
  for (const pa of A) {
    const inA = new Set(pa.map(([r, c]) => `${r},${c}`))
    for (const pb of B) {
      let total = 0
      const seen = new Set()
      for (const [r, c] of pb) {
        const k = `${r},${c}`
        if (inA.has(k) && !seen.has(k)) { seen.add(k); total += grid[r][c] }
      }
      best = Math.max(best, total)
    }
  }
  return best
}

test('3938 random small grids match path enumeration', () => {
  let seed = 3938
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const rows = 2 + rnd(3)
    const cols = 2 + rnd(3)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(21) - 10))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
