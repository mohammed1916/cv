import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

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

test('1112 sample keeps the highest grade and breaks ties by the smallest course id', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { student_id: 1, course_id: 102, grade: 90 },
    { student_id: 2, course_id: 101, grade: 70 },
    { student_id: 3, course_id: 102, grade: 95 },
  ])
})

test('1112 a single course per student is its own answer', () => {
  const trace = run('{"Enrollments":[{"student_id":4,"course_id":9,"grade":50}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ student_id: 4, course_id: 9, grade: 50 }])
})

test('1112 rejects an enrollment without a grade', () => {
  assert.throws(() => parseInput('{"Enrollments":[{"student_id":1,"course_id":2}]}'))
})
