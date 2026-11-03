import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, sampleText } from './algorithm.js'

const PHASES = ['load', 'pair', 'filter', 'direction', 'done']

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

test('1917 sample recommends users 1 and 2 in both directions only', () => {
  const run = buildTrace(parseInput(sampleText))
  assert.deepEqual(run.result, [
    { user_id: 1, recommended_id: 2 },
    { user_id: 2, recommended_id: 1 },
  ])
  checkFrames(run)
})

test('1917 three shared songs across different days do not qualify', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Listens: [
      { user_id: 1, song_id: 1, day: 'a' }, { user_id: 1, song_id: 2, day: 'a' },
      { user_id: 2, song_id: 1, day: 'a' }, { user_id: 2, song_id: 2, day: 'a' },
      { user_id: 1, song_id: 3, day: 'b' }, { user_id: 2, song_id: 3, day: 'b' },
    ],
    Friendship: [],
  })))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('1917 rejects a repeated user, song and day row', () => {
  assert.throws(() => parseInput(JSON.stringify({
    Listens: [{ user_id: 1, song_id: 1, day: 'a' }, { user_id: 1, song_id: 1, day: 'a' }],
    Friendship: [],
  })))
})
