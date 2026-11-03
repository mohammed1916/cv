import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = values => buildTrace(values).result

test('3667 hand-checked values', () => {
  assert.deepEqual(solve([-4, -1, 0, 2, 10]), [0, -1, 2, -4, 10])
  assert.deepEqual(solve([3, -3, 2]), [2, 3, -3])
  assert.deepEqual(solve([7]), [7])
  assert.deepEqual(solve([-20, 20, 0]), [0, -20, 20])
})

test('3667 equal absolute values keep their original order', () => {
  assert.deepEqual(solve([5, -5, 5]), [5, -5, 5])
})

test('3667 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[21]'))
  assert.throws(() => parseInput('[1.5]'))
})

test('3667 frames carry valid lines and phases', () => {
  const trace = buildTrace([-4, 1, 3])
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of trace.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(phaseIds.has(frame.phase))
  }
})

// Oracle: a stable sort by absolute value, which fixes the order among equal absolute values.
test('3667 matches a stable sort on random arrays', () => {
  let seed = 3667
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rnd(8) }, () => rnd(11) - 5)
    const expected = values.map((v, i) => ({ v, i })).sort((a, b) => Math.abs(a.v) - Math.abs(b.v) || a.i - b.i).map(x => x.v)
    assert.deepEqual(solve(values), expected, JSON.stringify(values))
  }
})
