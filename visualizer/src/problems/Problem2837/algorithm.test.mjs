import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('2837 result matches the hand-computed sample', () => {
  assert.deepEqual(run.result, [
    { user_id: 1, name: 'Alice', traveled_distance: 200 },
    { user_id: 2, name: 'Bob', traveled_distance: 0 },
    { user_id: 3, name: 'Carol', traveled_distance: 45 },
  ])
})

test('2837 rejects malformed input', () => {
  assert.throws(() => parseInput(JSON.stringify({ users: [{ user_id: 1, name: 'A' }], rides: [{ ride_id: 1, user_id: 9, distance: 5 }] })))
})

test('2837 frame invariants hold', () => {
  const ids = new Set(phases.map(p => p.id))
  assert.ok(run.frames.length > 0)
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
