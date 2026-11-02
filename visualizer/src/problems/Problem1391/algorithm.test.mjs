import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('1391 worked examples', () => {
  assert.equal(solve([[2, 4, 3], [6, 5, 2]]), true)
  assert.equal(solve([[1, 2, 1], [1, 2, 1]]), false)
  assert.equal(solve([[1, 1, 2]]), false)
})

// Each street type opens onto a set of sides; two neighbours connect only when both open toward each other.
const OPEN = { 1: 'LR', 2: 'UD', 3: 'LD', 4: 'RD', 5: 'LU', 6: 'RU' }
const TOWARD = { L: [0, -1, 'R'], R: [0, 1, 'L'], U: [-1, 0, 'D'], D: [1, 0, 'U'] }

// Independent oracle: union-find over mutually open neighbour pairs.
function oracle(grid) {
  const m = grid.length, n = grid[0].length
  const parent = Array.from({ length: m * n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      for (const side of OPEN[grid[r][c]]) {
        const [dr, dc, back] = TOWARD[side]
        const nr = r + dr, nc = c + dc
        if (nr < 0 || nc < 0 || nr >= m || nc >= n) continue
        if (!OPEN[grid[nr][nc]].includes(back)) continue
        parent[find(r * n + c)] = find(nr * n + nc)
      }
    }
  }
  return find(0) === find(m * n - 1)
}

test('1391 random grids match a union-find oracle', () => {
  let seed = 1391
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const m = 1 + rnd(4), n = 1 + rnd(4)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(6)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
