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

test('1069 sample sums quantities per product', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { product_id: 11, total_quantity: 10 },
    { product_id: 22, total_quantity: 7 },
  ])
})

test('1069 a single sale is its own total', () => {
  const trace = run('{"Sales":[{"sale_id":1,"product_id":5,"year":2000,"quantity":9,"price":1}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ product_id: 5, total_quantity: 9 }])
})

test('1069 rejects a sale without a quantity', () => {
  assert.throws(() => parseInput('{"Sales":[{"sale_id":1,"product_id":5,"year":2000,"price":1}]}'))
})
