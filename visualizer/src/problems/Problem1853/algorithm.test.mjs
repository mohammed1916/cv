import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)

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

test('1853 formats dates in day order with no leading zero on the day', () => {
  const trace = buildTrace(parseInput('{"Days":[{"day":"2020-11-03"},{"day":"2021-01-01"},{"day":"2000-02-29"}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { formatted_day: 'Tuesday, February 29, 2000' },
    { formatted_day: 'Tuesday, November 3, 2020' },
    { formatted_day: 'Friday, January 1, 2021' },
  ])
})

test('1853 keeps a double-digit day as written', () => {
  const trace = buildTrace(parseInput('{"Days":[{"day":"2021-03-14"}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ formatted_day: 'Sunday, March 14, 2021' }])
})

test('1853 rejects a date that does not exist', () => {
  assert.throws(() => parseInput('{"Days":[{"day":"2021-02-30"}]}'))
})
