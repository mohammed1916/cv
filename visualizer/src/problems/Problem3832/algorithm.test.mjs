import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, sampleText } from './algorithm.js'

const PHASES = ['load', 'days', 'run', 'choose', 'order', 'done']

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASES.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(frame.message.length > 0)
    assert.ok(Array.isArray(frame.table.columns) && Array.isArray(frame.table.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).table.rows, run.result)
}

test('3832 sample gives the hand-computed rows', () => {
  const run = buildTrace(parseInput(sampleText))
  assert.deepEqual(run.result, [
    { user_id: 1, action: 'view', streak_length: 6, start_date: '2024-01-01', end_date: '2024-01-06' },
    { user_id: 3, action: 'search', streak_length: 6, start_date: '2024-03-06', end_date: '2024-03-11' },
    { user_id: 2, action: 'buy', streak_length: 5, start_date: '2024-02-06', end_date: '2024-02-10' },
    { user_id: 4, action: 'login', streak_length: 5, start_date: '2024-04-01', end_date: '2024-04-05' },
    { user_id: 5, action: 'x', streak_length: 5, start_date: '2024-05-10', end_date: '2024-05-14' },
  ])
  checkFrames(run)
})

test('3832 a mixed-action day breaks a run and a short run is dropped', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    activity: [
      { user_id: 7, action_date: '2024-06-01', action: 'a' }, { user_id: 7, action_date: '2024-06-02', action: 'a' },
      { user_id: 7, action_date: '2024-06-03', action: 'a' }, { user_id: 7, action_date: '2024-06-03', action: 'b' },
      { user_id: 7, action_date: '2024-06-04', action: 'a' }, { user_id: 7, action_date: '2024-06-05', action: 'a' },
    ],
  })))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('3832 rejects a malformed date', () => {
  assert.throws(() => parseInput(JSON.stringify({ activity: [{ user_id: 1, action_date: '2024-1-2', action: 'a' }] })))
})
