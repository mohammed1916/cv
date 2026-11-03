import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('1285 runs match the hand-built ranges', () => {
  // Sorted ids: 1 2 3 | 5 6 | 8 | 10 11 12 13.
  assert.deepEqual(run.result, [
    { start_id: 1, end_id: 3 },
    { start_id: 5, end_id: 6 },
    { start_id: 8, end_id: 8 },
    { start_id: 10, end_id: 13 },
  ])
})

test('1285 frame invariants hold', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).rows, run.result)
})

test('1285 a single id forms a one-id range', () => {
  assert.deepEqual(buildTrace({ logs: [42] }).result, [{ start_id: 42, end_id: 42 }])
})
