import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = (mat, threshold) => buildTrace(parseInput(JSON.stringify({ mat, threshold }))).result

test('1292 sample matrices return the largest fitting side', () => {
  assert.equal(solve([[1, 1, 3], [1, 2, 4], [2, 2, 2]], 6), 2)
  assert.equal(solve([[2, 2], [2, 2]], 1), 0)
  assert.equal(solve([[5]], 5), 1)
  assert.equal(solve([[0, 0, 0], [0, 0, 0]], 0), 2)
})

test('1292 frames use declared phases and valid line numbers', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace({ mat: [[1, 2], [3, 4]], threshold: 7 })
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1, f.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('1292 rejects malformed matrices and thresholds', () => {
  assert.throws(() => parseInput('{"mat":[[1,2],[3]],"threshold":2}'), /rectangle/)
  assert.throws(() => parseInput('{"mat":[[1]],"threshold":-1}'), /threshold/)
  assert.throws(() => parseInput('{"mat":[[21]],"threshold":2}'), /0 to 20/)
})

test('1292 random matrices match a brute-force square search', () => {
  let seed = 17
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const m = 1 + rnd(6), n = 1 + rnd(6)
    const mat = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(10)))
    const threshold = rnd(60)
    let expected = 0
    for (let k = 1; k <= Math.min(m, n); k++) for (let i = 0; i + k <= m; i++) for (let j = 0; j + k <= n; j++) {
      let s = 0
      for (let a = i; a < i + k; a++) for (let b = j; b < j + k; b++) s += mat[a][b]
      if (s <= threshold) expected = Math.max(expected, k)
    }
    assert.equal(solve(mat, threshold), expected, JSON.stringify({ mat, threshold }))
  }
})
