import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

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

const SAMPLE = '{"Orders":[{"item_count":2,"order_occurrences":3},{"item_count":4,"order_occurrences":1},{"item_count":5,"order_occurrences":2}]}'
const run = text => buildTrace(parseInput(text))

test('2985 weights each size by its occurrences: 20 items over 6 orders', () => {
  assert.deepEqual(run(SAMPLE).result, [{ average_items_per_order: 3.33 }])
  assertFrames(run(SAMPLE))
})

test('2985 returns a whole mean without extra decimals', () => {
  const text = '{"Orders":[{"item_count":1,"order_occurrences":1},{"item_count":3,"order_occurrences":1}]}'
  assert.deepEqual(run(text).result, [{ average_items_per_order: 2 }])
  assertFrames(run(text))
})

test('2985 rejects a zero occurrence count', () => {
  assert.throws(() => parseInput('{"Orders":[{"item_count":1,"order_occurrences":0}]}'))
})
