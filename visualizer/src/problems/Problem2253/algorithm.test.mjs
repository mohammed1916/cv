import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

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

test('2253 unpivots non-NULL prices in product and store order', () => {
  const trace = run('{"Products":[{"product_id":1,"store1":10,"store2":null,"store3":12},{"product_id":2,"store1":null,"store2":7,"store3":null}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { product_id: 1, store: 'store1', price: 10 },
    { product_id: 1, store: 'store3', price: 12 },
    { product_id: 2, store: 'store2', price: 7 },
  ])
})

test('2253 reads store names from whatever columns the table has', () => {
  const trace = run('{"Products":[{"product_id":5,"east":3,"west":null}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ product_id: 5, store: 'east', price: 3 }])
})

test('2253 rejects a text price', () => {
  assert.throws(() => parseInput('{"Products":[{"product_id":1,"store1":"x"}]}'))
})
