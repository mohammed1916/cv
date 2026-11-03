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

const SAMPLE = '{"Contacts":[{"id":1,"first_name":"Ana","last_name":"Lee"},{"id":2,"first_name":"Ben","last_name":"Cruz"},{"id":3,"first_name":"Chen","last_name":"Wu"},{"id":4,"first_name":"Dara","last_name":"Kim"},{"id":5,"first_name":"Eli","last_name":"Ross"}],"Calls":[{"contact_id":1,"type":"voice","duration":3725},{"contact_id":2,"type":"voice","duration":120},{"contact_id":3,"type":"voice","duration":3725},{"contact_id":4,"type":"voice","duration":61},{"contact_id":2,"type":"voice","duration":900},{"contact_id":5,"type":"video","duration":45},{"contact_id":4,"type":"video","duration":7200},{"contact_id":1,"type":"video","duration":600},{"contact_id":3,"type":"video","duration":30}]}'

test('3124 sample keeps the three longest calls per type with HH:MM:SS durations', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { call_type: 'video', contact_name: 'Dara Kim', duration: '02:00:00', call_rank: 1 },
    { call_type: 'video', contact_name: 'Ana Lee', duration: '00:10:00', call_rank: 2 },
    { call_type: 'video', contact_name: 'Eli Ross', duration: '00:00:45', call_rank: 3 },
    { call_type: 'voice', contact_name: 'Ana Lee', duration: '01:02:05', call_rank: 1 },
    { call_type: 'voice', contact_name: 'Chen Wu', duration: '01:02:05', call_rank: 2 },
    { call_type: 'voice', contact_name: 'Ben Cruz', duration: '00:15:00', call_rank: 3 },
  ])
})

test('3124 equal durations are ordered by contact name', () => {
  const trace = run('{"Contacts":[{"id":1,"first_name":"Zed","last_name":"Ng"},{"id":2,"first_name":"Amy","last_name":"Ng"}],"Calls":[{"contact_id":1,"type":"voice","duration":3600},{"contact_id":2,"type":"voice","duration":3600}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { call_type: 'voice', contact_name: 'Amy Ng', duration: '01:00:00', call_rank: 1 },
    { call_type: 'voice', contact_name: 'Zed Ng', duration: '01:00:00', call_rank: 2 },
  ])
})

test('3124 rejects a call whose contact is missing', () => {
  assert.throws(() => parseInput('{"Contacts":[{"id":1,"first_name":"A","last_name":"B"}],"Calls":[{"contact_id":9,"type":"voice","duration":5}]}'))
})
