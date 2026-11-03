import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text))

test('1412 sample keeps only the student who is never an extreme', () => {
  const { result } = solve('{"students":[{"student_id":1,"student_name":"Ann"},{"student_id":2,"student_name":"Ben"},{"student_id":3,"student_name":"Cal"},{"student_id":4,"student_name":"Dee"},{"student_id":5,"student_name":"Eve"}],"exams":[{"exam_id":1,"student_id":1,"score":50},{"exam_id":1,"student_id":2,"score":70},{"exam_id":1,"student_id":3,"score":90},{"exam_id":2,"student_id":1,"score":60},{"exam_id":2,"student_id":2,"score":55},{"exam_id":2,"student_id":4,"score":40}]}')
  assert.deepEqual(result, [{ student_id: 2, student_name: 'Ben' }])
})

test('1412 a tie at the low score disqualifies both tied students', () => {
  const { result } = solve('{"students":[{"student_id":1,"student_name":"Ann"},{"student_id":2,"student_name":"Ben"},{"student_id":3,"student_name":"Cal"},{"student_id":4,"student_name":"Dee"}],"exams":[{"exam_id":1,"student_id":1,"score":50},{"exam_id":1,"student_id":2,"score":50},{"exam_id":1,"student_id":3,"score":60},{"exam_id":1,"student_id":4,"score":90}]}')
  assert.deepEqual(result, [{ student_id: 3, student_name: 'Cal' }])
})

test('1412 a student with no exam rows is not reported', () => {
  const { result } = solve('{"students":[{"student_id":1,"student_name":"Ann"},{"student_id":2,"student_name":"Ben"}],"exams":[{"exam_id":1,"student_id":1,"score":50}]}')
  assert.deepEqual(result, [])
})

test('1412 rejects a duplicate exam row and an unknown student', () => {
  assert.throws(() => parseInput('{"students":[{"student_id":1,"student_name":"Ann"}],"exams":[{"exam_id":1,"student_id":1,"score":5},{"exam_id":1,"student_id":1,"score":6}]}'))
  assert.throws(() => parseInput('{"students":[{"student_id":1,"student_name":"Ann"}],"exams":[{"exam_id":1,"student_id":2,"score":5}]}'))
})

test('1412 frames keep phase, line and row invariants', () => {
  const { frames } = solve('{"students":[{"student_id":1,"student_name":"Ann"},{"student_id":2,"student_name":"Ben"},{"student_id":3,"student_name":"Cal"}],"exams":[{"exam_id":1,"student_id":1,"score":50},{"exam_id":1,"student_id":2,"score":70},{"exam_id":1,"student_id":3,"score":90}]}')
  const pyLines = python.split('\n').length
  for (const f of frames) {
    assert.equal(typeof f.phase, 'string')
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.message.length > 0)
    assert.ok(Array.isArray(f.columns) && Array.isArray(f.rows))
  }
  assert.equal(frames.at(-1).phase, 'output')
})
