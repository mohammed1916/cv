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

test('2720 sample gives 50, 33.33 and 16.67 percent over six users', () => {
  const trace = run('{"Friends":[{"user1":1,"user2":2},{"user1":1,"user2":3},{"user1":2,"user2":3},{"user1":4,"user2":1},{"user1":5,"user2":6}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { user_id: 1, popularity_percentage: 50 },
    { user_id: 2, popularity_percentage: 33.33 },
    { user_id: 3, popularity_percentage: 33.33 },
    { user_id: 4, popularity_percentage: 16.67 },
    { user_id: 5, popularity_percentage: 16.67 },
    { user_id: 6, popularity_percentage: 16.67 },
  ])
})

test('2720 a single friendship between two users gives 50 percent each', () => {
  const trace = run('{"Friends":[{"user1":7,"user2":8}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { user_id: 7, popularity_percentage: 50 },
    { user_id: 8, popularity_percentage: 50 },
  ])
})

test('2720 rejects the same friendship listed in both orders', () => {
  assert.throws(() => parseInput('{"Friends":[{"user1":1,"user2":2},{"user1":2,"user2":1}]}'))
})
