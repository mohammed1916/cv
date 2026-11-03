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

test('1070 sample keeps every record from each first sale year', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { product_id: 11, first_year: 2010, quantity: 3, price: 40 },
    { product_id: 11, first_year: 2010, quantity: 2, price: 41 },
    { product_id: 22, first_year: 2011, quantity: 15, price: 9 },
  ])
})

test('1070 ties in the earliest year are all retained', () => {
  const trace = run('{"Sales":[{"sale_id":1,"product_id":3,"year":1999,"quantity":1,"price":1},{"sale_id":2,"product_id":3,"year":1999,"quantity":4,"price":2}]}')
  checkFrames(trace)
  assert.equal(trace.result.length, 2)
})

test('1070 rejects a sales row without a year', () => {
  assert.throws(() => parseInput('{"Sales":[{"sale_id":1,"product_id":3,"quantity":1,"price":1}]}'))
})
