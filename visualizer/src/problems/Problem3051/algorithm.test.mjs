import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('3051 sample keeps candidates 1, 3 and 4 and ignores the duplicate skill row', () => {
  const trace = run('{"Candidates":[{"candidate_id":1,"skill":"Python"},{"candidate_id":1,"skill":"Tableau"},{"candidate_id":1,"skill":"PostgreSQL"},{"candidate_id":2,"skill":"Python"},{"candidate_id":3,"skill":"PostgreSQL"},{"candidate_id":3,"skill":"Tableau"},{"candidate_id":3,"skill":"Python"},{"candidate_id":4,"skill":"Python"},{"candidate_id":4,"skill":"Tableau"},{"candidate_id":4,"skill":"PostgreSQL"},{"candidate_id":5,"skill":"Python"},{"candidate_id":5,"skill":"Python"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ candidate_id: 1 }, { candidate_id: 3 }, { candidate_id: 4 }])
})

test('3051 a repeated required skill does not replace a missing one', () => {
  const trace = run('{"Candidates":[{"candidate_id":9,"skill":"Python"},{"candidate_id":9,"skill":"Python"},{"candidate_id":9,"skill":"Tableau"},{"candidate_id":9,"skill":"PostgreSQL"},{"candidate_id":8,"skill":"Python"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ candidate_id: 9 }])
})

test('3051 rejects a row without a skill', () => {
  assert.throws(() => parseInput('{"Candidates":[{"candidate_id":1}]}'))
})
