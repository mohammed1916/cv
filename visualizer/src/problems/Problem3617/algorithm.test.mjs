import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm.js'

const PHASES = new Set(['load', 'mark', 'keep', 'skip', 'order', 'done'])

function checkFrames(frames) {
  const pyLineCount = python.split('\n').length
  for (const f of frames) {
    assert.ok(PHASES.has(f.phase), `unknown phase ${f.phase}`)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLineCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
}

test('3617 sample: student 1 spirals for 8 sessions, student 3 for 6, student 2 is short', () => {
  const run = buildTrace(parseInput(SAMPLE_TEXT))
  assert.deepEqual(run.result, [
    { student_id: 1, spiral_length: 8 },
    { student_id: 3, spiral_length: 6 },
  ])
  checkFrames(run.frames)
})

test('3617 a sequence with no repeats has no spiral', () => {
  const input = {
    min_length: 4,
    sessions: ['Math', 'Science', 'History', 'Art', 'Music'].map((subject, i) => ({
      session_id: i + 1, student_id: 8, study_date: `2024-04-0${i + 1}`, subject,
    })),
  }
  assert.deepEqual(buildTrace(input).result, [])
})

test('3617 rejects a session without a subject', () => {
  assert.throws(() => parseInput('{"min_length":4,"sessions":[{"session_id":1,"student_id":1,"study_date":"2024-01-01"}]}'))
})
