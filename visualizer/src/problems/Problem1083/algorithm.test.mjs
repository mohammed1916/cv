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

test('1083 sample keeps S8 buyers who never bought the second product', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ buyer_id: 10 }, { buyer_id: 12 }])
})

test('1083 a buyer of the second product only is not returned', () => {
  const trace = run('{"Product":[{"product_id":1,"product_name":"S8"},{"product_id":2,"product_name":"iPhone"}],"Sales":[{"product_id":2,"buyer_id":7}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('1083 rejects a product without a name', () => {
  assert.throws(() => parseInput('{"Product":[{"product_id":1}],"Sales":[{"product_id":1,"buyer_id":2}]}'))
})
