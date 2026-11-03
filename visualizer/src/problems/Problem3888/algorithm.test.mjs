import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, k) => buildTrace({ grid, k }).result

// Oracle: enumerate how many squares start at each corner (small counts) and keep the cheapest plan that equalizes the grid.
function oracle(grid, k) {
  const m = grid.length
  const n = grid[0].length
  const corners = []
  for (let i = 0; i + k <= m; i += 1) for (let j = 0; j + k <= n; j += 1) corners.push([i, j])
  const C = 7
  let best = -1
  const counts = Array(corners.length).fill(0)
  const check = () => {
    const out = grid.map(r => r.slice())
    let total = 0
    corners.forEach(([i, j], idx) => {
      total += counts[idx]
      for (let di = 0; di < k; di += 1) for (let dj = 0; dj < k; dj += 1) out[i + di][j + dj] += counts[idx]
    })
    const flat = out.flat()
    if (flat.every(v => v === flat[0]) && (best === -1 || total < best)) best = total
  }
  const walk = idx => {
    if (idx === corners.length) return check()
    for (let c = 0; c <= C; c += 1) {
      counts[idx] = c
      walk(idx + 1)
    }
    counts[idx] = 0
  }
  walk(0)
  return best
}

test('3888 hand-checked presets', () => {
  assert.equal(solve([[1, 2], [2, 3]], 2), oracle([[1, 2], [2, 3]], 2))
  assert.equal(solve([[0, 1, 0], [1, 1, 1]], 2), -1)
})

test('3888 a uniform grid needs no operations', () => {
  assert.equal(solve([[3, 3], [3, 3]], 2), 0)
})

test('3888 k equal to 1 raises each cell independently', () => {
  assert.equal(solve([[0, 2], [1, 2]], 1), 3)
})

test('3888 parser rejects a non-rectangular grid', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]],"k":1}'))
})

test('3888 frames end with the operation count', () => {
  const run = buildTrace({ grid: [[1, 2], [2, 3]], k: 2 })
  assert.equal(run.frames.at(-1).ops, run.result)
})

test('3888 matches the enumeration oracle on small grids', () => {
  let seed = 3888
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const m = 2 + rnd(2)
    const n = 2 + rnd(2)
    const k = 1 + rnd(2)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(3)))
    const corners = (m - k + 1) * (n - k + 1)
    if (corners > 4) continue
    assert.equal(solve(grid, k), oracle(grid, k), JSON.stringify({ grid, k }))
  }
})
