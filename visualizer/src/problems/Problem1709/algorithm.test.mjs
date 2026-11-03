import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'window', 'done'])

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(PHASES.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.columns))
  }
  assert.deepEqual(run.frames.at(-1).rows, run.result)
}

test('1709 finds the largest gap, including the gap to 2021-01-01', () => {
  const run = buildTrace(parseInput(JSON.stringify({ UserVisits: [
    { user_id: 2, visit_date: '2020-06-15' },
    { user_id: 1, visit_date: '2020-12-01' },
    { user_id: 3, visit_date: '2020-12-31' },
    { user_id: 1, visit_date: '2020-01-01' },
    { user_id: 3, visit_date: '2020-12-31' },
    { user_id: 1, visit_date: '2020-01-11' },
  ] })))
  // user 1: 10 days, 325 days, then 31 days to 2021-01-01; user 2: 200 days to the end; user 3: 0 then 1 day.
  assert.deepEqual(run.result, [
    { user_id: 1, biggest_window: 325 },
    { user_id: 2, biggest_window: 200 },
    { user_id: 3, biggest_window: 1 },
  ])
  checkFrames(run)
})

test('1709 a visit on 2021-01-01 itself gives a window of 0', () => {
  const run = buildTrace(parseInput('{"UserVisits":[{"user_id":4,"visit_date":"2021-01-01"}]}'))
  assert.deepEqual(run.result, [{ user_id: 4, biggest_window: 0 }])
  checkFrames(run)
})

test('1709 rejects a visit after the observation end date', () => {
  assert.throws(() => parseInput('{"UserVisits":[{"user_id":1,"visit_date":"2021-01-02"}]}'))
})
