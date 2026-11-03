import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: sort the letters by their destination index.
const oracle = (s, indices) => s.split('').map((ch, i) => [indices[i], ch]).sort((a, b) => a[0] - b[0]).map(p => p[1]).join('')

test('1528 sample inputs restore the expected strings', () => {
  assert.equal(buildTrace({ s: 'harvest', indices: [2, 0, 5, 6, 1, 3, 4] }).result, 'aehstrv')
  assert.equal(buildTrace({ s: 'abc', indices: [0, 1, 2] }).result, 'abc')
  assert.equal(buildTrace({ s: 'zyxw', indices: [3, 2, 1, 0] }).result, 'wxyz')
})

test('1528 random permutations match the sorting oracle', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(10)
    const s = Array.from({ length: n }, () => 'abcdefghijklmnopqrstuvwxyz'[rnd(26)]).join('')
    const indices = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [indices[i], indices[j]] = [indices[j], indices[i]] }
    assert.equal(buildTrace({ s, indices }).result, oracle(s, indices))
  }
})

test('1528 rejects inputs that are not permutations', () => {
  assert.throws(() => parseInput('{"s":"abc","indices":[0,0,1]}'), /exactly once/)
  assert.throws(() => parseInput('{"s":"abc","indices":[0,1]}'), /exactly once/)
  assert.throws(() => parseInput('{"s":"AB","indices":[0,1]}'), /lowercase/)
})

test('1528 frames use declared phases and lines inside the solver', () => {
  const run = buildTrace({ s: 'harvest', indices: [2, 0, 5, 6, 1, 3, 4] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
