import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('1951 sample counts users 1 and 3 as sharing three followers', () => {
  // Followers: 1 {10,11,12}, 2 {10,11,13}, 3 {10,11,12}, 4 {13}. Pair (1,3) shares 3; (1,2) and (2,3) share 2.
  const trace = run('{"Relations":[{"user_id":1,"follower_id":10},{"user_id":1,"follower_id":11},{"user_id":1,"follower_id":12},{"user_id":2,"follower_id":10},{"user_id":2,"follower_id":11},{"user_id":2,"follower_id":13},{"user_id":3,"follower_id":11},{"user_id":3,"follower_id":12},{"user_id":3,"follower_id":10},{"user_id":4,"follower_id":13}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user1_id: 1, user2_id: 3 }])
})

test('1951 returns every pair tied for the maximum', () => {
  const trace = run('{"Relations":[{"user_id":1,"follower_id":5},{"user_id":1,"follower_id":6},{"user_id":2,"follower_id":5},{"user_id":2,"follower_id":6},{"user_id":3,"follower_id":5},{"user_id":3,"follower_id":6}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { user1_id: 1, user2_id: 2 },
    { user1_id: 1, user2_id: 3 },
    { user1_id: 2, user2_id: 3 },
  ])
})

test('1951 rejects a row without follower_id', () => {
  assert.throws(() => parseInput('{"Relations":[{"user_id":1}]}'))
})
