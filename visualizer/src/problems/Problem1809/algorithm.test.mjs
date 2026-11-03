import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const SAMPLE = '{"Playback":[{"session_id":1,"customer_id":1,"start_time":10,"end_time":20},{"session_id":2,"customer_id":1,"start_time":30,"end_time":40},{"session_id":3,"customer_id":2,"start_time":5,"end_time":15},{"session_id":4,"customer_id":2,"start_time":50,"end_time":60}],"Ads":[{"ad_id":1,"customer_id":1,"timestamp":25},{"ad_id":2,"customer_id":2,"timestamp":15},{"ad_id":3,"customer_id":1,"timestamp":40},{"ad_id":4,"customer_id":3,"timestamp":55}]}'

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

test('1809 sample keeps sessions 1 and 4 only', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ session_id: 1 }, { session_id: 4 }])
})

test('1809 an ad exactly at a session boundary blocks that session', () => {
  const trace = buildTrace(parseInput('{"Playback":[{"session_id":7,"customer_id":1,"start_time":10,"end_time":20}],"Ads":[{"ad_id":1,"customer_id":1,"timestamp":10}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('1809 rejects a session that ends before it starts', () => {
  assert.throws(() => parseInput('{"Playback":[{"session_id":1,"customer_id":1,"start_time":9,"end_time":3}],"Ads":[{"ad_id":1,"customer_id":1,"timestamp":4}]}'))
})
