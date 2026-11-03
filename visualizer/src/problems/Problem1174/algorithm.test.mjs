import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))

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

const sample = examples[0].input
const run = text => buildTrace(parseInput(text))

test('1174 measures only each customer first order', () => {
  assert.deepEqual(run(sample).result, [{ immediate_percentage: 40 }])
  assertFrames(run(sample))
})

test('1174 rejects two first orders tied on the same date', () => {
  assert.throws(() => parseInput('{"deliveries":[{"delivery_id":1,"customer_id":1,"order_date":"2019-08-01","customer_pref_delivery_date":"2019-08-01"},{"delivery_id":2,"customer_id":1,"order_date":"2019-08-01","customer_pref_delivery_date":"2019-08-02"}]}'))
})
