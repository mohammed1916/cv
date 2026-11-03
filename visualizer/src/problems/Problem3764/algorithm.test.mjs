import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, examples } from './algorithm.js'

const row = (user_id, course_id, course_name, completion_date, course_rating) => ({ user_id, course_id, course_name, completion_date, course_rating })

test('3764 sample data gives the hand-computed pair counts', () => {
  const run = buildTrace(parseInput(examples[0].input))
  assert.deepEqual(run.result, [
    { first_course: 'ML', second_course: 'Viz', transition_count: 3 },
    { first_course: 'SQL', second_course: 'Stats', transition_count: 3 },
    { first_course: 'Stats', second_course: 'ML', transition_count: 3 },
    { first_course: 'Python', second_course: 'SQL', transition_count: 2 },
    { first_course: 'Viz', second_course: 'Python', transition_count: 1 },
  ])
})

test('3764 users with fewer than five courses or a mean below four are dropped', () => {
  const run = buildTrace({
    course_completions: [
      row(1, 1, 'A', '2026-01-01', 4), row(1, 2, 'B', '2026-01-02', 4), row(1, 3, 'C', '2026-01-03', 4), row(1, 4, 'D', '2026-01-04', 4),
      row(2, 5, 'A', '2026-01-01', 3), row(2, 6, 'B', '2026-01-02', 3), row(2, 7, 'C', '2026-01-03', 3), row(2, 8, 'D', '2026-01-04', 3), row(2, 9, 'E', '2026-01-05', 5),
    ],
  })
  assert.deepEqual(run.result, [])
})

test('3764 a mean of exactly four qualifies', () => {
  const run = buildTrace({
    course_completions: ['A', 'B', 'C', 'D', 'E'].map((name, i) => row(9, i + 1, name, `2026-05-0${i + 1}`, 4)),
  })
  assert.deepEqual(run.result.map(p => `${p.first_course}>${p.second_course}`), ['A>B', 'B>C', 'C>D', 'D>E'])
})

test('3764 parse rejects bad rows and same-day ties', () => {
  assert.throws(() => parseInput('{"course_completions":[{"user_id":1,"course_id":1,"course_name":"A","completion_date":"2026-01-01","course_rating":6}]}'))
  assert.throws(() => parseInput('{"course_completions":[{"user_id":1,"course_id":1,"course_name":"A","completion_date":"01/01/2026","course_rating":4}]}'))
  assert.throws(() => parseInput('{"course_completions":[' +
    '{"user_id":1,"course_id":1,"course_name":"A","completion_date":"2026-01-01","course_rating":4},' +
    '{"user_id":1,"course_id":2,"course_name":"B","completion_date":"2026-01-01","course_rating":4}]}'))
})

test('3764 frames carry the required fields and valid line numbers', () => {
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.ok(run.frames.length > 2)
    for (const frame of run.frames) {
      assert.equal(typeof frame.phase, 'string')
      assert.equal(typeof frame.message, 'string')
      assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
      assert.ok(Array.isArray(frame.rows))
    }
    assert.equal(run.frames[0].phase, 'load')
    assert.deepEqual(run.frames.at(-1).rows, run.result)
  }
})

test('3764 pair counts never exceed the number of kept consecutive transitions', () => {
  const run = buildTrace(parseInput(examples[0].input))
  const total = run.result.reduce((sum, p) => sum + p.transition_count, 0)
  assert.equal(total, 4 + 4 + 4)
})
