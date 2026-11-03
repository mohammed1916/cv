import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))
const SAMPLE = JSON.stringify({ Friends: [
  { user_id1: 1, user_id2: 2 }, { user_id1: 2, user_id2: 1 }, { user_id1: 2, user_id2: 3 },
  { user_id1: 1, user_id2: 3 }, { user_id1: 3, user_id2: 4 }, { user_id1: 4, user_id2: 5 },
  { user_id1: 3, user_id2: 5 }, { user_id1: 6, user_id2: 7 }, { user_id1: 7, user_id2: 8 },
] })

function assertFrames(trace) {
  assert.ok(trace.frames.length > 1)
  for (const frame of trace.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `unknown phase ${frame.phase}`)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

test('3058 keeps only friend pairs with no common friend', () => {
  // Every pair in the 1-5 cluster shares a friend; 6-7 and 7-8 share none.
  const trace = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(trace.result, [{ user1: 6, user2: 7 }, { user1: 7, user2: 8 }])
  assertFrames(trace)
})

test('3058 a repeated friendship in either order appears once', () => {
  const trace = buildTrace(parseInput('{"Friends":[{"user_id1":1,"user_id2":2},{"user_id1":2,"user_id2":1},{"user_id1":2,"user_id2":1}]}'))
  assert.deepEqual(trace.result, [{ user1: 1, user2: 2 }])
  assertFrames(trace)
})

test('3058 rejects a self friendship', () => {
  assert.throws(() => parseInput('{"Friends":[{"user_id1":1,"user_id2":1}]}'), /themselves/)
})
