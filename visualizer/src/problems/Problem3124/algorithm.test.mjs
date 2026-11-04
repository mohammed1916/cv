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

const SAMPLE = '{"Contacts":[{"id":1,"first_name":"Ana","last_name":"Lee"},{"id":2,"first_name":"Ben","last_name":"Cruz"},{"id":3,"first_name":"Chen","last_name":"Wu"},{"id":4,"first_name":"Dara","last_name":"Kim"},{"id":5,"first_name":"Eli","last_name":"Ross"}],"Calls":[{"contact_id":1,"type":"outgoing","duration":3725},{"contact_id":2,"type":"incoming","duration":120},{"contact_id":3,"type":"outgoing","duration":3725},{"contact_id":4,"type":"incoming","duration":61},{"contact_id":2,"type":"outgoing","duration":900},{"contact_id":5,"type":"incoming","duration":45},{"contact_id":4,"type":"outgoing","duration":7200},{"contact_id":1,"type":"incoming","duration":600},{"contact_id":3,"type":"incoming","duration":30}]}'

test('3124 keeps ranks up to three per type; ties share a rank', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { first_name: 'Dara', type: 'outgoing', duration_formatted: '02:00:00' },
    { first_name: 'Chen', type: 'outgoing', duration_formatted: '01:02:05' },
    { first_name: 'Ana', type: 'outgoing', duration_formatted: '01:02:05' },
    { first_name: 'Ana', type: 'incoming', duration_formatted: '00:10:00' },
    { first_name: 'Ben', type: 'incoming', duration_formatted: '00:02:00' },
    { first_name: 'Dara', type: 'incoming', duration_formatted: '00:01:01' },
  ])
})

test('3124 rejects a call whose contact is missing or a type outside incoming and outgoing', () => {
  assert.throws(() => parseInput('{"Contacts":[{"id":1,"first_name":"A","last_name":"B"}],"Calls":[{"contact_id":9,"type":"incoming","duration":5}]}'))
  assert.throws(() => parseInput('{"Contacts":[{"id":1,"first_name":"A","last_name":"B"}],"Calls":[{"contact_id":1,"type":"voice","duration":5}]}'))
})
