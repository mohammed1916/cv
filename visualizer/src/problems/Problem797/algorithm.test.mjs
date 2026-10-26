import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const countPaths = g => { const memo = []; const f = u => u === g.length - 1 ? 1 : (memo[u] ??= g[u].reduce((s, v) => s + f(v), 0)); return f(0) }
test('official examples', () => {
  assert.deepEqual(buildTrace([[1, 2], [3], [3], []]).result, [[0, 1, 3], [0, 2, 3]])
  assert.equal(buildTrace([[4, 3, 1], [3, 2, 4], [3], [4], []]).result.length, 5)
})
test('paths are valid, distinct and match the DP path count on random DAGs', () => {
  for (let t = 0; t < 300; t++) {
    const n = 2 + Math.floor(Math.random() * 7)
    const g = Array.from({ length: n }, (_, u) => Array.from({ length: n - u - 1 }, (_, k) => u + 1 + k).filter(() => Math.random() < 0.5))
    const run = buildTrace(parseInput(JSON.stringify(g)))
    assert.equal(run.result.length, countPaths(g))
    assert.equal(new Set(run.result.map(String)).size, run.result.length)
    for (const p of run.result) {
      assert.equal(p[0], 0); assert.equal(p.at(-1), n - 1)
      for (let i = 1; i < p.length; i++) assert.ok(g[p[i - 1]].includes(p[i]))
    }
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('[[1],[0]]'))
  assert.throws(() => parseInput('[[0],[]]'))
  assert.throws(() => parseInput('[[]]'))
})
