import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (grid, k) => buildTrace({ grid, k }).result

test('4046 single cell and straight lines', () => {
  assert.equal(solve([[7]], 0), 7)
  assert.equal(solve([[1, 2, 3]], 0), 6)
  assert.equal(solve([[1], [2], [3]], 0), 6)
})

test('4046 turn limits decide the answer', () => {
  assert.equal(solve([[1, 2, 3], [4, 5, 6]], 1), 12)
  assert.equal(solve([[1, 2, 3], [4, 5, 6]], 0), -1)
  assert.equal(solve([[1, 3, 1], [1, 5, 1], [4, 2, 1]], 2), 7)
})

test('4046 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace({ grid: [[1, 3], [2, 4]], k: 1 })
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.phase)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('4046 rejects bad grids and k', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]],"k":0}'))
  assert.throws(() => parseInput('{"grid":[[1,2],[3,4]],"k":2}'))
  assert.throws(() => parseInput('{"grid":[[10]],"k":0}'))
})

// Independent oracle: Bellman-Ford style relaxation over the same state space until nothing improves.
function oracle(grid, k) {
  const R = grid.length
  const C = grid[0].length
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  const INF = Infinity
  const dist = new Map()
  const key = (r, c, d, t) => `${r}|${c}|${d}|${t}`
  dist.set(key(0, 0, -1, 0), grid[0][0])
  let changed = true
  while (changed) {
    changed = false
    for (const [k1, cost] of [...dist]) {
      const [r, c, d, t] = k1.split('|').map(Number)
      for (let nd = 0; nd < 4; nd++) {
        const nt = t + (d !== -1 && nd !== d ? 1 : 0)
        if (nt > k) continue
        const nr = r + dirs[nd][0]
        const nc = c + dirs[nd][1]
        if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue
        const nk = key(nr, nc, nd, nt)
        const nv = cost + grid[nr][nc]
        if (nv < (dist.get(nk) ?? INF)) {
          dist.set(nk, nv)
          changed = true
        }
      }
    }
  }
  let best = INF
  for (const [k1, cost] of dist) {
    const [r, c] = k1.split('|').map(Number)
    if (r === R - 1 && c === C - 1) best = Math.min(best, cost)
  }
  return best === INF ? -1 : best
}

test('4046 random small grids match a Bellman-Ford oracle', () => {
  let seed = 4046
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const R = 1 + rnd(4)
    const C = 1 + rnd(4)
    const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => rnd(10)))
    const k = rnd(Math.min(R, C))
    assert.equal(solve(grid, k), oracle(grid, k), JSON.stringify({ grid, k }))
  }
})
