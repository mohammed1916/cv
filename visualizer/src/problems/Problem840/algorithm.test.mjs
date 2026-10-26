import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(g) {
  let n = 0
  for (let r = 0; r + 2 < g.length; r++) for (let c = 0; c + 2 < g[0].length; c++) {
    const w = [0, 1, 2].map(i => [0, 1, 2].map(j => g[r + i][c + j]))
    const set = new Set(w.flat())
    if (set.size !== 9 || [...set].some(v => v < 1 || v > 9)) continue
    const lines = new Set([
      ...w.map(row => row.reduce((a, b) => a + b)),
      ...[0, 1, 2].map(j => w[0][j] + w[1][j] + w[2][j]),
      w[0][0] + w[1][1] + w[2][2], w[0][2] + w[1][1] + w[2][0],
    ])
    if (lines.size === 1) n++
  }
  return n
}
test('official examples', () => {
  assert.equal(buildTrace([[4, 3, 8, 4], [9, 5, 1, 9], [2, 7, 6, 2]]).result, 1)
  assert.equal(buildTrace([[8]]).result, 0)
})
test('random grids and planted squares match brute force', () => {
  let seed = 7
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  const magic = [[4, 3, 8], [9, 5, 1], [2, 7, 6]]
  for (let t = 0; t < 400; t++) {
    const R = 1 + rnd(7), C = 1 + rnd(7)
    const g = Array.from({ length: R }, () => Array.from({ length: C }, () => rnd(11)))
    if (R >= 3 && C >= 3 && rnd(2)) { const r = rnd(R - 2), c = rnd(C - 2); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g[r + i][c + j] = magic[i][j] }
    const tr = buildTrace(g)
    assert.equal(tr.result, brute(g), JSON.stringify(g))
    assert.equal(tr.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[[1,2],[3]]')); assert.throws(() => parseInput('[]')); assert.throws(() => parseInput('[[1.5]]'))
})
