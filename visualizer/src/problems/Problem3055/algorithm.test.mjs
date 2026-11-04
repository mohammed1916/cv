import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))
const SAMPLE = JSON.stringify({ Fraud: [
  { policy_id: 1, state: 'NY', fraud_score: 90 }, { policy_id: 2, state: 'NY', fraud_score: 40 },
  { policy_id: 3, state: 'NY', fraud_score: 75 }, { policy_id: 4, state: 'NY', fraud_score: 60 },
  { policy_id: 10, state: 'NY', fraud_score: 20 }, { policy_id: 11, state: 'NY', fraud_score: 20 },
  { policy_id: 12, state: 'NY', fraud_score: 5 }, { policy_id: 13, state: 'NY', fraud_score: 65 },
  { policy_id: 5, state: 'CA', fraud_score: 88 }, { policy_id: 6, state: 'CA', fraud_score: 10 },
  { policy_id: 7, state: 'CA', fraud_score: 88 }, { policy_id: 8, state: 'CA', fraud_score: 33 },
  { policy_id: 9, state: 'TX', fraud_score: 50 },
] })

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

test('3055 keeps the top 5 percent of each state, rounded up, ties by policy_id', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(trace.result, [
    { policy_id: 5, state: 'CA', fraud_score: 88 },
    { policy_id: 1, state: 'NY', fraud_score: 90 },
    { policy_id: 9, state: 'TX', fraud_score: 50 },
  ])
  assertFrames(trace)
})

test('3055 a state with one policy keeps that policy', () => {
  const trace = buildTrace(parseInput('{"Fraud":[{"policy_id":9,"state":"TX","fraud_score":50}]}'))
  assert.deepEqual(trace.result, [{ policy_id: 9, state: 'TX', fraud_score: 50 }])
  assertFrames(trace)
})

test('3055 rejects duplicate policy ids', () => {
  assert.throws(() => parseInput('{"Fraud":[{"policy_id":1,"state":"NY","fraud_score":1},{"policy_id":1,"state":"NY","fraud_score":2}]}'), /unique/)
})
