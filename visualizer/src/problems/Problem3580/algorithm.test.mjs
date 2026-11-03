import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const SAMPLE = JSON.stringify({
  employees: [
    { employee_id: 1, name: 'Ana', department: 'eng' },
    { employee_id: 2, name: 'Ben', department: 'eng' },
    { employee_id: 3, name: 'Cara', department: 'ops' },
    { employee_id: 4, name: 'Dev', department: 'ops' },
  ],
  performance_reviews: [
    { review_id: 1, employee_id: 1, review_date: '2024-01-01', rating: 3 },
    { review_id: 2, employee_id: 1, review_date: '2024-04-01', rating: 4 },
    { review_id: 3, employee_id: 1, review_date: '2024-07-01', rating: 6 },
    { review_id: 4, employee_id: 2, review_date: '2024-02-01', rating: 5 },
    { review_id: 5, employee_id: 2, review_date: '2024-05-01', rating: 5 },
    { review_id: 6, employee_id: 2, review_date: '2024-08-01', rating: 7 },
    { review_id: 7, employee_id: 3, review_date: '2024-01-10', rating: 2 },
    { review_id: 8, employee_id: 3, review_date: '2024-03-10', rating: 4 },
    { review_id: 9, employee_id: 3, review_date: '2024-06-10', rating: 5 },
    { review_id: 10, employee_id: 3, review_date: '2024-09-10', rating: 8 },
    { review_id: 11, employee_id: 4, review_date: '2024-05-01', rating: 9 },
  ],
})

const PHASES = ['load', 'group', 'latest', 'check', 'output']

function checkFrames(run) {
  const pythonCount = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(PHASES.includes(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonCount)
    assert.ok(frame.message.length > 0)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.result))
  }
  let previous = 0
  for (const frame of run.frames) {
    assert.ok(frame.result.length >= previous, 'result never shrinks')
    previous = frame.result.length
  }
  assert.deepEqual(run.frames.at(-1).result, run.result)
}

test('3580 sample keeps Cara (+4) and Ana (+3) and rejects the flat Ben', () => {
  const run = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(run.result, [
    { employee_id: 3, name: 'Cara', improvement: 4 },
    { employee_id: 1, name: 'Ana', improvement: 3 },
  ])
  checkFrames(run)
})

test('3580 only the three most recent reviews count', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    employees: [{ employee_id: 1, name: 'Eli' }],
    performance_reviews: [
      { review_id: 1, employee_id: 1, review_date: '2024-01-01', rating: 9 },
      { review_id: 2, employee_id: 1, review_date: '2024-02-01', rating: 1 },
      { review_id: 3, employee_id: 1, review_date: '2024-03-01', rating: 2 },
      { review_id: 4, employee_id: 1, review_date: '2024-04-01', rating: 3 },
    ],
  })))
  assert.deepEqual(run.result, [{ employee_id: 1, name: 'Eli', improvement: 2 }])
  checkFrames(run)
})

test('3580 rejects two reviews on the same date for one employee', () => {
  assert.throws(() => parseInput('{"employees":[{"employee_id":1,"name":"A"}],"performance_reviews":[{"review_id":1,"employee_id":1,"review_date":"2024-01-01","rating":2},{"review_id":2,"employee_id":1,"review_date":"2024-01-01","rating":3}]}'))
})
