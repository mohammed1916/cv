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

const sample = '{"Purchases":[{"purchase_id":1,"user_id":1,"purchase_date":"2024-01-01"},{"purchase_id":2,"user_id":1,"purchase_date":"2024-01-05"},{"purchase_id":3,"user_id":2,"purchase_date":"2024-01-01"},{"purchase_id":4,"user_id":2,"purchase_date":"2024-01-09"},{"purchase_id":5,"user_id":2,"purchase_date":"2024-01-17"},{"purchase_id":6,"user_id":3,"purchase_date":"2024-02-01"},{"purchase_id":7,"user_id":3,"purchase_date":"2024-02-01"}]}'

test('2228 sample keeps users with a close pair, including same-day purchases', () => {
  const trace = run(sample)
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 1 }, { user_id: 3 }])
})

test('2228 a gap of exactly seven days qualifies', () => {
  const trace = run('{"Purchases":[{"purchase_id":8,"user_id":9,"purchase_date":"2024-01-01"},{"purchase_id":9,"user_id":9,"purchase_date":"2024-01-08"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 9 }])
})

test('2228 rejects a purchase date that is not YYYY-MM-DD', () => {
  assert.throws(() => parseInput('{"Purchases":[{"purchase_id":1,"user_id":1,"purchase_date":"01/02/2024"}]}'))
})
