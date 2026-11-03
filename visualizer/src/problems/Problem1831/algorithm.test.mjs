import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const SAMPLE = '{"Transactions":[{"transaction_id":1,"day":"2020-11-03 09:00:00","amount":500},{"transaction_id":2,"day":"2020-11-03 18:00:00","amount":900},{"transaction_id":3,"day":"2020-11-03 12:00:00","amount":900},{"transaction_id":4,"day":"2020-11-04 08:00:00","amount":200},{"transaction_id":5,"day":"2020-11-04 21:00:00","amount":150},{"transaction_id":6,"day":"2020-11-05 10:00:00","amount":75}]}'

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

test('1831 sample keeps the tied maxima of each day', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ transaction_id: 2 }, { transaction_id: 3 }, { transaction_id: 4 }, { transaction_id: 6 }])
})

test('1831 a day with one transaction keeps that transaction', () => {
  const trace = buildTrace(parseInput('{"Transactions":[{"transaction_id":9,"day":"2021-01-01 00:00:00","amount":10}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ transaction_id: 9 }])
})

test('1831 rejects a day that does not start with a calendar date', () => {
  assert.throws(() => parseInput('{"Transactions":[{"transaction_id":1,"day":"11/03/2020","amount":5}]}'))
})
