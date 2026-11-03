import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))
const SAMPLE = JSON.stringify({
  Activities: [
    { activity_id: 1, user_id: 1, activity_type: 'send', time_spent: 10 },
    { activity_id: 2, user_id: 1, activity_type: 'open', time_spent: 30 },
    { activity_id: 3, user_id: 1, activity_type: 'chat', time_spent: 5 },
    { activity_id: 4, user_id: 2, activity_type: 'send', time_spent: 20 },
    { activity_id: 5, user_id: 2, activity_type: 'open', time_spent: 20 },
    { activity_id: 6, user_id: 3, activity_type: 'send', time_spent: 5 },
    { activity_id: 7, user_id: 3, activity_type: 'open', time_spent: 15 },
    { activity_id: 8, user_id: 4, activity_type: 'open', time_spent: 40 },
    { activity_id: 9, user_id: 5, activity_type: 'send', time_spent: 10 },
    { activity_id: 10, user_id: 5, activity_type: 'chat', time_spent: 10 },
  ],
  Age: [
    { age_bucket: 'teen', user_id: 1 }, { age_bucket: 'teen', user_id: 2 },
    { age_bucket: 'adult', user_id: 3 }, { age_bucket: 'adult', user_id: 4 }, { age_bucket: 'adult', user_id: 5 },
  ],
})

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

test('3056 splits send and open time per age bucket, ignoring chat', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  // teen: send 30 and open 50 of 80; adult: send 15 and open 55 of 70 (chat excluded).
  assert.deepEqual(trace.result, [
    { age_bucket: 'adult', send_perc: 21.43, open_perc: 78.57 },
    { age_bucket: 'teen', send_perc: 37.5, open_perc: 62.5 },
  ])
  assertFrames(trace)
})

test('3056 a bucket with only other activity types is left out', () => {
  const trace = buildTrace(parseInput('{"Activities":[{"activity_id":1,"user_id":1,"activity_type":"chat","time_spent":9}],"Age":[{"age_bucket":"teen","user_id":1}]}'))
  assert.deepEqual(trace.result, [])
  assertFrames(trace)
})

test('3056 rejects a non-positive time_spent', () => {
  assert.throws(() => parseInput('{"Activities":[{"activity_id":1,"user_id":1,"activity_type":"send","time_spent":0}],"Age":[]}'), /time_spent/)
})
