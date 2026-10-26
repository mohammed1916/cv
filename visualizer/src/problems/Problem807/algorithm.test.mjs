import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const sky = g => [g.map(r => Math.max(...r)), g[0].map((_, c) => Math.max(...g.map(r => r[c])))].join('|')
test('official examples', () => {
  assert.equal(buildTrace(parseInput('[[3,0,8,4],[2,4,5,7],[9,2,6,3],[0,3,1,0]]')).result, 35)
  assert.equal(buildTrace(parseInput('[[0,0,0],[0,0,0],[0,0,0]]')).result, 0)
})
test('random: skyline preserved and no cell can grow further', () => {
  let seed = 5
  const rnd = m => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % m
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const g = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd(10)))
    const r = buildTrace(g)
    const h = r.frames.at(-1).raised
    assert.equal(sky(h), sky(g))
    let gain = 0
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      gain += h[i][j] - g[i][j]
      const bumped = h.map(x => [...x]); bumped[i][j] += 1
      assert.notEqual(sky(bumped), sky(g)) // maximal
    }
    assert.equal(gain, r.result)
  }
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('[[1,2]]'))
  assert.throws(() => parseInput('[[101]]'))
  assert.throws(() => parseInput('3'))
})
