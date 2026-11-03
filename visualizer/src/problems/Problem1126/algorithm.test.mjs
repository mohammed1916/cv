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

test('1126 keeps only businesses above the type average for more than one type', () => {
  assert.deepEqual(run(sample).result, [{ business_id: 1 }])
  assertFrames(run(sample))
})

test('1126 equal to the average does not qualify', () => {
  const flat = '{"events":[{"business_id":1,"event_type":"a","occurrences":4},{"business_id":2,"event_type":"a","occurrences":4},{"business_id":2,"event_type":"b","occurrences":9},{"business_id":1,"event_type":"b","occurrences":1}]}'
  assert.deepEqual(run(flat).result, [])
})

test('1126 rejects a missing occurrences value', () => {
  assert.throws(() => parseInput('{"events":[{"business_id":1,"event_type":"a"}]}'))
})
