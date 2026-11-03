import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)

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

test('2072 sample: New York has three strong scores against two', () => {
  const trace = buildTrace(parseInput('{"NewYork":[{"student_id":1,"score":95},{"student_id":2,"score":88},{"student_id":3,"score":91},{"student_id":4,"score":90}],"California":[{"student_id":1,"score":70},{"student_id":2,"score":92},{"student_id":3,"score":99}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ winner: 'New York University' }])
})

test('2072 equal counts produce No Winner', () => {
  const trace = buildTrace(parseInput('{"NewYork":[{"student_id":1,"score":90}],"California":[{"student_id":5,"score":91}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ winner: 'No Winner' }])
})

test('2072 rejects a score outside 0 to 100', () => {
  assert.throws(() => parseInput('{"NewYork":[{"student_id":1,"score":101}],"California":[]}'))
})
