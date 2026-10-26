import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const brute = g => {
  const n = g.length
  for (let m = 0; m < 1 << n; m++) if (g.every((row, u) => row.every(v => (m >> u & 1) !== (m >> v & 1)))) return true
  return false
}
test('official examples', () => {
  assert.equal(buildTrace([[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]).result, false)
  assert.equal(buildTrace([[1, 3], [0, 2], [1, 3], [0, 2]]).result, true)
})
test('matches brute-force 2-colouring on random graphs', () => {
  for (let t = 0; t < 300; t++) {
    const n = 1 + Math.floor(Math.random() * 8)
    const g = Array.from({ length: n }, () => [])
    for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (Math.random() < 0.3) { g[u].push(v); g[v].push(u) }
    const run = buildTrace(parseInput(JSON.stringify(g)))
    assert.equal(run.result, brute(g))
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('[[1],[]]'))
  assert.throws(() => parseInput('[[0]]'))
  assert.throws(() => parseInput('[]'))
})
