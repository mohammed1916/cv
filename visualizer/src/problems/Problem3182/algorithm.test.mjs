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

test('3182 sample keeps Ann and Cy, drops Ben, Dee and the no-requirement student', () => {
  const trace = run('{"Students":[{"student_id":1,"name":"Ann","major":"CS"},{"student_id":2,"name":"Ben","major":"CS"},{"student_id":3,"name":"Cy","major":"Math"},{"student_id":4,"name":"Dee","major":"Bio"}],"Courses":[{"course_id":1,"name":"Algorithms","credits":4,"major":"CS"},{"course_id":2,"name":"Databases","credits":3,"major":"CS"},{"course_id":3,"name":"Calculus","credits":4,"major":"Math"}],"Enrollments":[{"student_id":1,"course_id":1,"semester":"2024S","grade":90},{"student_id":1,"course_id":2,"semester":"2024S","grade":95},{"student_id":2,"course_id":1,"semester":"2024S","grade":92},{"student_id":2,"course_id":2,"semester":"2024S","grade":85},{"student_id":3,"course_id":3,"semester":"2024S","grade":91},{"student_id":3,"course_id":1,"semester":"2024S","grade":60}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ student_id: 1, name: 'Ann' }, { student_id: 3, name: 'Cy' }])
})

test('3182 a missing required course disqualifies even with high grades', () => {
  const trace = run('{"Students":[{"student_id":5,"name":"Eve","major":"CS"}],"Courses":[{"course_id":1,"name":"Algorithms","credits":4,"major":"CS"},{"course_id":2,"name":"Databases","credits":3,"major":"CS"}],"Enrollments":[{"student_id":5,"course_id":1,"semester":"2024S","grade":99}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('3182 a grade of exactly 90 qualifies and 89 does not', () => {
  const trace = run('{"Students":[{"student_id":6,"name":"Fay","major":"CS"},{"student_id":7,"name":"Gus","major":"CS"}],"Courses":[{"course_id":1,"name":"Algorithms","credits":4,"major":"CS"}],"Enrollments":[{"student_id":6,"course_id":1,"semester":"2024S","grade":90},{"student_id":7,"course_id":1,"semester":"2024S","grade":89}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ student_id: 6, name: 'Fay' }])
})
