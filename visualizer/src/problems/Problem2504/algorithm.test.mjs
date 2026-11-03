import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))

function assertFrames(trace) {
  assert.ok(trace.frames.length > 1)
  for (const frame of trace.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `unknown phase ${frame.phase}`)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

test('2504 builds Name(P) from the first profession letter, largest person_id first', () => {
  const trace = buildTrace(parseInput(JSON.stringify({ Person: [
    { person_id: 5, name: 'Eli', profession: 'Writer' },
    { person_id: 2, name: 'Bob', profession: 'Doctor' },
    { person_id: 7, name: 'Ann', profession: 'Chef' },
    { person_id: 3, name: 'Carl', profession: 'Teacher' },
  ] })))
  assert.deepEqual(trace.result, [
    { person_id: 7, display_name: 'Ann(C)' },
    { person_id: 5, display_name: 'Eli(W)' },
    { person_id: 3, display_name: 'Carl(T)' },
    { person_id: 2, display_name: 'Bob(D)' },
  ])
  assertFrames(trace)
})

test('2504 an empty Person table gives an empty result', () => {
  const trace = buildTrace(parseInput(JSON.stringify({ Person: [] })))
  assert.deepEqual(trace.result, [])
  assertFrames(trace)
})

test('2504 rejects a duplicate person_id', () => {
  assert.throws(() => parseInput(JSON.stringify({ Person: [
    { person_id: 1, name: 'Ana', profession: 'Nurse' },
    { person_id: 1, name: 'Ben', profession: 'Pilot' },
  ] })))
})
