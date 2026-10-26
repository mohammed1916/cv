import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = g => buildTrace(parseInput(JSON.stringify(g)))
function oracle(g) {
  const n = g.length, m = g[0].length, lab = g.map(r => r.map(() => 0)); let k = 0
  const fill = (r, c) => { if (r < 0 || c < 0 || r >= n || c >= m || !g[r][c] || lab[r][c]) return; lab[r][c] = k; fill(r + 1, c); fill(r - 1, c); fill(r, c + 1); fill(r, c - 1) }
  for (let r = 0; r < n; r++) for (let c = 0; c < m; c++) if (g[r][c] && !lab[r][c]) { k++; fill(r, c) }
  let best = Infinity
  for (let a = 0; a < n; a++) for (let b = 0; b < m; b++) if (lab[a][b] === 1)
    for (let c = 0; c < n; c++) for (let d = 0; d < m; d++) if (lab[c][d] === 2) best = Math.min(best, Math.abs(a - c) + Math.abs(b - d) - 1)
  return best
}
test('official examples', () => {
  assert.equal(solve([[0, 1], [1, 0]]).result, 1)
  assert.equal(solve([[0, 1, 0], [0, 0, 0], [0, 0, 1]]).result, 2)
  assert.equal(solve([[1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]]).result, 1)
})
test('random grids against Manhattan-distance oracle', () => {
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
  let tested = 0
  for (let t = 0; t < 4000 && tested < 300; t++) {
    const n = 2 + Math.floor(rnd() * 5), m = 2 + Math.floor(rnd() * 5)
    const g = Array.from({ length: n }, () => Array.from({ length: m }, () => rnd() < 0.3 ? 1 : 0))
    let run
    try { run = solve(g) } catch { continue }
    tested++
    assert.equal(run.result, oracle(g), JSON.stringify(g))
    assert.equal(run.frames.at(-1).phase, 'done')
  }
  assert.ok(tested > 50)
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('[[1,1],[1,1]]'))
  assert.throws(() => parseInput('[[1,0],[0,2]]'))
  assert.throws(() => parseInput('[[1]]'))
  assert.throws(() => parseInput('5'))
})
