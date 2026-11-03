import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

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

test('1097 sample groups players by install date with next-day retention', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { install_dt: '2016-03-01', installs: 1, Day1_retention: '1.00' },
    { install_dt: '2016-03-02', installs: 2, Day1_retention: '0.50' },
    { install_dt: '2017-06-25', installs: 1, Day1_retention: '0.00' },
  ])
})

test('1097 a month-end install date rolls over to the next month', () => {
  const trace = run('{"Activity":[{"player_id":5,"event_date":"2020-01-31"},{"player_id":5,"event_date":"2020-02-01"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ install_dt: '2020-01-31', installs: 1, Day1_retention: '1.00' }])
})

test('1097 rejects an activity row without an event date', () => {
  assert.throws(() => parseInput('{"Activity":[{"player_id":1}]}'))
})
