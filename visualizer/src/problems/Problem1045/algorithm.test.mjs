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

test('1045 sample keeps customers that cover all three products', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ customer_id: 1 }, { customer_id: 3 }])
})

test('1045 duplicate purchases do not replace a missing product', () => {
  const trace = run('{"Customer":[{"customer_id":9,"product_key":1},{"customer_id":9,"product_key":2},{"customer_id":9,"product_key":2},{"customer_id":8,"product_key":1}],"Product":[{"product_key":1},{"product_key":2}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ customer_id: 9 }])
})

test('1045 rejects a table without its columns', () => {
  assert.throws(() => parseInput('{"Customer":[{"customer_id":1}],"Product":[{"product_key":1}]}'))
})
