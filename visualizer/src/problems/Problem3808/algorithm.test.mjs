import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, sampleText } from './algorithm.js'

const PHASES = ['load', 'group', 'filter', 'order', 'done']

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

test('3808 sample gives the hand-computed rows', () => {
  const run = buildTrace(parseInput(sampleText))
  assert.deepEqual(run.result, [
    { user_id: 9, dominant_reaction: 'love', reaction_ratio: 1 },
    { user_id: 7, dominant_reaction: 'like', reaction_ratio: 0.8 },
    { user_id: 5, dominant_reaction: 'angry', reaction_ratio: 0.6 },
  ])
  checkFrames(run)
})

test('3808 a share just under 60 percent is dropped and four items are too few', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    reactions: [
      { user_id: 1, content_id: 1, reaction: 'a' }, { user_id: 1, content_id: 2, reaction: 'a' },
      { user_id: 1, content_id: 3, reaction: 'b' }, { user_id: 1, content_id: 4, reaction: 'b' },
      { user_id: 1, content_id: 5, reaction: 'c' },
      { user_id: 2, content_id: 1, reaction: 'x' }, { user_id: 2, content_id: 2, reaction: 'x' },
      { user_id: 2, content_id: 3, reaction: 'x' }, { user_id: 2, content_id: 4, reaction: 'x' },
    ],
  })))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('3808 rejects a duplicate user and content pair', () => {
  assert.throws(() => parseInput(JSON.stringify({
    reactions: [{ user_id: 1, content_id: 1, reaction: 'a' }, { user_id: 1, content_id: 1, reaction: 'b' }],
  })))
})
