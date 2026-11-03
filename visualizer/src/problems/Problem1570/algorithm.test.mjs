import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0)

test('own sample vectors give the plain dot product', () => {
  assert.equal(buildTrace({ a: [0, 4, 0, -2, 1], b: [3, 0, 1, 2, 0] }).result, dot([0, 4, 0, -2, 1], [3, 0, 1, 2, 0]))
  assert.equal(buildTrace({ a: [5, 0, 0], b: [0, 0, 2] }).result, 0)
  assert.equal(buildTrace({ a: [2, 0, 5], b: [1, 0, 2] }).result, 12)
})

test('random sparse vectors agree with the direct dot product', () => {
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rand(12)
    const a = Array.from({ length: len }, () => (rand(3) === 0 ? rand(11) - 5 : 0))
    const b = Array.from({ length: len }, () => (rand(3) === 0 ? rand(11) - 5 : 0))
    assert.equal(buildTrace({ a, b }).result, dot(a, b), JSON.stringify({ a, b }))
  }
})

test('every frame names a real code line, a Python line and a known phase', () => {
  const run = buildTrace({ a: [1, 0, 2], b: [0, 3, 4] })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
    assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('parseInput rejects mismatched or malformed vectors', () => {
  assert.throws(() => parseInput('{"a":[1,2],"b":[1]}'), /same length/)
  assert.throws(() => parseInput('{"a":[9],"b":[1]}'), /-5 to 5/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})
