import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = t => buildTrace(parseInput(t))
function stable(g) {
  const R = g.length, C = g[0].length, seen = g.map(r => r.map(() => false)), st = []
  for (let c = 0; c < C; c++) if (g[0][c] === 1) { seen[0][c] = true; st.push([0, c]) }
  while (st.length) {
    const [r, c] = st.pop()
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = r + dr, b = c + dc
      if (a >= 0 && a < R && b >= 0 && b < C && g[a][b] === 1 && !seen[a][b]) { seen[a][b] = true; st.push([a, b]) }
    }
  }
  return seen
}
function brute(grid, hits) {
  const g = grid.map(r => [...r])
  return hits.map(([r, c]) => {
    if (g[r][c] === 0) return 0
    g[r][c] = 0
    const s = stable(g); let fell = 0
    g.forEach((row, i) => row.forEach((v, j) => { if (v === 1 && !s[i][j]) { fell++; g[i][j] = 0 } }))
    return fell
  })
}
test('official examples', () => {
  assert.deepEqual(solve('{"grid":[[1,0,0,0],[1,1,1,0]],"hits":[[1,0]]}').result, [2])
  assert.deepEqual(solve('{"grid":[[1,0,0,0],[1,1,0,0]],"hits":[[1,1],[1,0]]}').result, [0, 0])
})
test('random vs forward simulation', () => {
  let seed = 3
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 400; t++) {
    const R = 1 + rnd(5), C = 1 + rnd(5)
    const raw = Array.from({ length: R }, () => Array.from({ length: C }, () => (rnd(3) ? 1 : 0)))
    const keep = stable(raw) // LeetCode guarantees every initial brick is stable
    const grid = raw.map((row, i) => row.map((v, j) => (v && keep[i][j] ? 1 : 0)))
    const cells = []; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) cells.push([r, c])
    const hits = []; const k = rnd(Math.min(cells.length, 8) + 1)
    for (let i = 0; i < k; i++) hits.push(cells.splice(rnd(cells.length), 1)[0])
    const run = buildTrace({ grid, hits })
    assert.deepEqual(run.result, brute(grid, hits))
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('{"grid":[[1]],"hits":[[1,0]]}'))
  assert.throws(() => parseInput('{"grid":[[1]],"hits":[[0,0],[0,0]]}'))
  assert.throws(() => parseInput('[]'))
})
