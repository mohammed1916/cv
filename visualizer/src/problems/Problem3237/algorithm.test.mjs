import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (windows, activations) => buildTrace({ windows, activations }).result

test('3237 presets and edge cases', () => {
  assert.deepEqual(solve(4, [2, 1, 2, 3]), [3, 2, 1, 4])
  assert.deepEqual(solve(1, [1, 1]), [1])
  assert.deepEqual(solve(3, [3, 2, 1]), [1, 2, 3])
  assert.deepEqual(solve(3, []), [1, 2, 3])
})

test('3237 rejects bad input', () => {
  assert.throws(() => parseInput('{"windows":0,"activations":[]}'))
  assert.throws(() => parseInput('{"windows":2,"activations":[3]}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Oracle: a window's rank is set by its last activation time (newest first). Never-activated
// windows keep their starting relative order after the activated ones.
function oracle(windows, activations) {
  const last = new Map()
  activations.forEach((w, t) => last.set(w, t))
  const ids = Array.from({ length: windows }, (_, k) => k + 1)
  return ids
    .map((id, start) => ({ id, start, t: last.has(id) ? last.get(id) : -1 }))
    .sort((a, b) => (b.t - a.t) || (a.start - b.start))
    .map(x => x.id)
}

test('3237 random inputs match the last-activation oracle', () => {
  let seed = 3237
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const windows = 1 + rnd(8)
    const activations = Array.from({ length: rnd(15) }, () => 1 + rnd(windows))
    assert.deepEqual(solve(windows, activations), oracle(windows, activations), JSON.stringify({ windows, activations }))
  }
})

test('3237 frames stay inside the pseudocode and Python listings', () => {
  const pyLines = python.split('\n').length
  const run = buildTrace({ windows: 4, activations: [2, 1, 2, 3] })
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
  assert.deepEqual(run.frames.at(-1).order, run.result)
})
