import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const scores = [
  { student_id: 1, subject: 'Math', score: 80, exam_date: '2024-02-01' },
  { student_id: 1, subject: 'Math', score: 60, exam_date: '2024-01-01' },
  { student_id: 1, subject: 'Math', score: 70, exam_date: '2024-03-01' },
  { student_id: 2, subject: 'Art', score: 90, exam_date: '2024-01-10' },
  { student_id: 2, subject: 'Art', score: 85, exam_date: '2024-02-10' },
  { student_id: 3, subject: 'Math', score: 50, exam_date: '2024-01-05' },
  { student_id: 3, subject: 'Art', score: 40, exam_date: '2024-01-03' },
  { student_id: 3, subject: 'Art', score: 40, exam_date: '2024-04-03' },
  { student_id: 4, subject: 'Math', score: 30, exam_date: '2024-01-05' },
  { student_id: 4, subject: 'Math', score: 65, exam_date: '2024-06-01' },
]

test('3421 keeps strict improvements between first and latest exam', () => {
  assert.deepEqual(buildTrace({ scores }).result, [
    { student_id: 1, subject: 'Math', first_score: 60, latest_score: 70 },
    { student_id: 4, subject: 'Math', first_score: 30, latest_score: 65 },
  ])
})

test('3421 ignores the middle exams and rows given out of date order', () => {
  // Middle score 95 does not matter: only the earliest (60) and latest (70) are compared.
  const rows = [
    { student_id: 7, subject: 'Bio', score: 60, exam_date: '2024-01-01' },
    { student_id: 7, subject: 'Bio', score: 95, exam_date: '2024-02-01' },
    { student_id: 7, subject: 'Bio', score: 70, exam_date: '2024-03-01' },
  ]
  assert.deepEqual(buildTrace({ scores: rows }).result, [{ student_id: 7, subject: 'Bio', first_score: 60, latest_score: 70 }])
})

test('3421 frame invariants hold', () => {
  const { frames } = buildTrace({ scores })
  const ids = new Set(phases.map(p => p.id))
  assert.ok(frames.length > 0)
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.rows))
  }
  assert.equal(frames.at(-1).phase, 'output')
})

test('3421 parseInput rejects a duplicate student, subject and date', () => {
  assert.throws(() => parseInput('{"scores":[{"student_id":1,"subject":"A","score":5,"exam_date":"2024-01-01"},{"student_id":1,"subject":"A","score":6,"exam_date":"2024-01-01"}]}'))
  assert.throws(() => parseInput('{"scores":[{"student_id":1,"subject":"A","score":5,"exam_date":"01/01/2024"}]}'))
})
