import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, sampleText } from './algorithm.js'

const PHASES = ['load', 'group', 'rate', 'done']

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

test('1934 sample gives 2 of 3 as 0.67, zero for users with no or only timeout events, and ignores user 99', () => {
  const run = buildTrace(parseInput(sampleText))
  assert.deepEqual(run.result, [
    { user_id: 3, confirmation_rate: 0.67 },
    { user_id: 7, confirmation_rate: 0 },
    { user_id: 9, confirmation_rate: 0 },
    { user_id: 12, confirmation_rate: 1 },
  ])
  checkFrames(run)
})

test('1934 a signed-up user with no events at all gets zero', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Signups: [{ user_id: 4, time_stamp: 'x' }],
    Confirmations: [],
  })))
  assert.deepEqual(run.result, [{ user_id: 4, confirmation_rate: 0 }])
  checkFrames(run)
})

test('1934 rejects an action other than confirmed or timeout', () => {
  assert.throws(() => parseInput(JSON.stringify({
    Signups: [],
    Confirmations: [{ user_id: 1, time_stamp: 'x', action: 'maybe' }],
  })))
})
