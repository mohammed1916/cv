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

test('1084 sample keeps products whose sales all fall in the quarter', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { product_id: 1, product_name: 'Phone X' },
    { product_id: 4, product_name: 'Lamp' },
  ])
})

test('1084 a product with no sales does not qualify', () => {
  const trace = run('{"Product":[{"product_id":8,"product_name":"Stool"}],"Sales":[{"product_id":9,"sale_date":"2019-01-01"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('1084 rejects a sale without a date', () => {
  assert.throws(() => parseInput('{"Product":[{"product_id":1,"product_name":"A"}],"Sales":[{"product_id":1}]}'))
})
