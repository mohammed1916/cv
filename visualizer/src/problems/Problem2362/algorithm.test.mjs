import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

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

test('2362 sample picks invoice 2 over invoice 3 on the 500 tie', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { product_id: 3, quantity: 4, price: 200 },
    { product_id: 1, quantity: 3, price: 300 },
  ])
})

test('2362 a single invoice is returned in full', () => {
  const trace = run('{"Products":[{"product_id":5,"price":9}],"Purchases":[{"invoice_id":7,"product_id":5,"quantity":2}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ product_id: 5, quantity: 2, price: 18 }])
})

test('2362 rejects a purchase without a quantity', () => {
  assert.throws(() => parseInput('{"Products":[{"product_id":1,"price":1}],"Purchases":[{"invoice_id":1,"product_id":1}]}'))
})
