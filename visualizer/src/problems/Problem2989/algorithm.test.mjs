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

test('totals 60, 15, 50 and 75 give a spread of 60', () => {
  const trace = run('{"Scores":[{"student_id":1,"student_name":"Ivy","assignment1":10,"assignment2":20,"assignment3":30},{"student_id":2,"student_name":"Jo","assignment1":5,"assignment2":5,"assignment3":5},{"student_id":3,"student_name":"Kai","assignment1":40,"assignment2":10,"assignment3":0},{"student_id":4,"student_name":"Lu","assignment1":25,"assignment2":25,"assignment3":25}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ difference_in_score: 60 }])
})

test('students with identical totals give a difference of zero', () => {
  const trace = run('{"Scores":[{"student_id":1,"student_name":"A","assignment1":3,"assignment2":3,"assignment3":3},{"student_id":2,"student_name":"B","assignment1":1,"assignment2":4,"assignment3":4}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ difference_in_score: 0 }])
})

test('rejects a row without the third assignment', () => {
  assert.throws(() => parseInput('{"Scores":[{"student_id":1,"student_name":"A","assignment1":3,"assignment2":3}]}'))
})
