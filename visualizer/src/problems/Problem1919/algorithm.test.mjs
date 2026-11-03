import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, sampleText } from './algorithm.js'

const PHASES = ['load', 'pair', 'filter', 'friends', 'done']

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

test('1919 sample keeps only the friend pair 4 and 5, written smaller id first', () => {
  const run = buildTrace(parseInput(sampleText))
  assert.deepEqual(run.result, [{ user1_id: 4, user2_id: 5 }])
  checkFrames(run)
})

test('1919 a friend pair with shared songs split across two days does not qualify', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Listens: [
      { user_id: 8, song_id: 1, day: 'a' }, { user_id: 8, song_id: 2, day: 'a' },
      { user_id: 9, song_id: 1, day: 'a' }, { user_id: 9, song_id: 2, day: 'a' },
      { user_id: 8, song_id: 3, day: 'b' }, { user_id: 9, song_id: 3, day: 'b' },
    ],
    Friendship: [{ user1_id: 9, user2_id: 8 }],
  })))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('1919 rejects a friendship that links a user to themselves', () => {
  assert.throws(() => parseInput(JSON.stringify({ Listens: [], Friendship: [{ user1_id: 3, user2_id: 3 }] })))
})
