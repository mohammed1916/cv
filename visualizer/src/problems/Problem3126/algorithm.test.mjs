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

const SAMPLE = '{"Servers":[{"server_id":1,"status_time":0,"session_status":"start"},{"server_id":1,"status_time":50000,"session_status":"stop"},{"server_id":2,"status_time":1000,"session_status":"start"},{"server_id":2,"status_time":40000,"session_status":"stop"},{"server_id":1,"status_time":60000,"session_status":"start"},{"server_id":1,"status_time":90000,"session_status":"stop"},{"server_id":3,"status_time":100,"session_status":"start"}]}'

test('3126 sample adds 119000 closed seconds and floors to one day', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ total_uptime_days: 1 }])
  const sum = trace.frames.find(frame => frame.phase === 'sum')
  assert.equal(sum.rows.reduce((total, row) => total + row.seconds, 0), 119000)
})

test('3126 an open session adds nothing and two full days floor to two', () => {
  const trace = run('{"Servers":[{"server_id":5,"status_time":0,"session_status":"start"},{"server_id":5,"status_time":172800,"session_status":"stop"},{"server_id":6,"status_time":10,"session_status":"start"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ total_uptime_days: 2 }])
})

test('3126 rejects an event that is neither start nor stop', () => {
  assert.throws(() => parseInput('{"Servers":[{"server_id":1,"status_time":0,"session_status":"pause"}]}'))
})
