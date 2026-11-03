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

test('1159 checks the brand of each seller second chronological sale', () => {
  assert.deepEqual(run(sample).result, [
    { seller_id: 1, second_item_fav_brand: 'no' },
    { seller_id: 2, second_item_fav_brand: 'no' },
    { seller_id: 3, second_item_fav_brand: 'yes' },
  ])
  assertFrames(run(sample))
})

test('1159 rejects an order that names an unknown item', () => {
  assert.throws(() => parseInput('{"users":[],"items":[],"orders":[{"order_id":1,"order_date":"2019-01-01","item_id":9,"buyer_id":1,"seller_id":2}]}'))
})
