import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const solve = input => buildTrace(parseInput(JSON.stringify(input)))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
    assert.equal(typeof frame.message, 'string')
  }
}

test('1892 sample: page 24 is counted from two friends, page 88 is skipped for user 1', () => {
  const trace = solve({
    Friendship: [{ user1_id: 1, user2_id: 2 }, { user1_id: 1, user2_id: 3 }, { user1_id: 2, user2_id: 4 }, { user1_id: 1, user2_id: 5 }],
    Likes: [{ user_id: 1, page_id: 88 }, { user_id: 2, page_id: 23 }, { user_id: 3, page_id: 24 }, { user_id: 3, page_id: 88 }, { user_id: 4, page_id: 23 }, { user_id: 5, page_id: 24 }],
  })
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { user_id: 1, page_id: 23, friends_likes: 1 },
    { user_id: 1, page_id: 24, friends_likes: 2 },
    { user_id: 2, page_id: 88, friends_likes: 1 },
    { user_id: 5, page_id: 88, friends_likes: 1 },
  ])
})

test('1892 pages liked by both users in a pair give nothing', () => {
  const trace = solve({ Friendship: [{ user1_id: 1, user2_id: 2 }], Likes: [{ user_id: 1, page_id: 7 }, { user_id: 2, page_id: 7 }] })
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('1892 a friendship is read in both directions', () => {
  const trace = solve({ Friendship: [{ user1_id: 1, user2_id: 2 }, { user1_id: 2, user2_id: 3 }], Likes: [{ user_id: 3, page_id: 9 }] })
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 2, page_id: 9, friends_likes: 1 }])
})
