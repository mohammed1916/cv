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

test('1068 sample joins names and drops the unmatched sale', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { product_name: 'Lamp', year: 2010, price: 40 },
    { product_name: 'Lamp', year: 2011, price: 41 },
    { product_name: 'Desk', year: 2011, price: 95 },
  ])
})

test('1068 output follows sale_id order even when input is unsorted', () => {
  const trace = run('{"Sales":[{"sale_id":2,"product_id":1,"year":2001,"quantity":1,"price":5},{"sale_id":1,"product_id":1,"year":2000,"quantity":1,"price":4}],"Product":[{"product_id":1,"product_name":"Mug"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result.map(row => row.year), [2000, 2001])
})

test('1068 rejects a product row without a name', () => {
  assert.throws(() => parseInput('{"Sales":[{"sale_id":1,"product_id":1,"year":2000,"quantity":1,"price":4}],"Product":[{"product_id":1}]}'))
})
