import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sampleText } from './algorithm.js'

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

test('2082 sample counts customers with one bill above 500', () => {
  const trace = buildTrace(parseInput(sampleText))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ rich_count: 2 }])
})

test('2082 bills of exactly 500 and split purchases do not count', () => {
  const trace = buildTrace(parseInput('{"Store":[{"bill_id":1,"customer_id":5,"amount":500},{"bill_id":2,"customer_id":5,"amount":300},{"bill_id":3,"customer_id":6,"amount":250}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ rich_count: 0 }])
})

test('2082 rejects a bill without its amount', () => {
  assert.throws(() => parseInput('{"Store":[{"bill_id":1,"customer_id":5}]}'))
})
