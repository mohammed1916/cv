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

test('1158 counts 2019 purchases for every user, including zeros', () => {
  assert.deepEqual(run(sample).result, [
    { buyer_id: 1, join_date: '2018-02-09', orders_2019: 2 },
    { buyer_id: 2, join_date: '2018-03-01', orders_2019: 0 },
    { buyer_id: 3, join_date: '2019-01-19', orders_2019: 1 },
    { buyer_id: 4, join_date: '2019-06-10', orders_2019: 1 },
  ])
  assertFrames(run(sample))
})

test('1158 rejects an order without a buyer', () => {
  assert.throws(() => parseInput('{"users":[],"orders":[{"order_id":1,"order_date":"2019-01-01","item_id":1,"seller_id":2}]}'))
})
