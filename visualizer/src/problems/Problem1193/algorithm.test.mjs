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

test('1193 summarises each month and country, with NULL country as its own group', () => {
  assert.deepEqual(run(sample).result, [
    { month: '2018-12', country: 'US', trans_count: 2, approved_count: 1, trans_total_amount: 3400, approved_total_amount: 1100 },
    { month: '2019-01', country: 'DE', trans_count: 2, approved_count: 1, trans_total_amount: 3000, approved_total_amount: 2600 },
    { month: '2019-01', country: 'US', trans_count: 1, approved_count: 1, trans_total_amount: 1700, approved_total_amount: 1700 },
    { month: '2019-01', country: null, trans_count: 1, approved_count: 1, trans_total_amount: 450, approved_total_amount: 450 },
  ])
  assertFrames(run(sample))
})

test('1193 rejects a state other than approved or declined', () => {
  assert.throws(() => parseInput('{"transactions":[{"id":1,"country":"US","state":"pending","amount":5,"trans_date":"2019-01-01"}]}'))
})
