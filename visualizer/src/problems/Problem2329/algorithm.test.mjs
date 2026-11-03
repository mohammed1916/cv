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

test('2329 sample totals each user and breaks the 25 tie by user ID', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { user_id: 7, spending: 40 },
    { user_id: 9, spending: 30 },
    { user_id: 3, spending: 25 },
    { user_id: 5, spending: 25 },
  ])
})

test('2329 one sale yields one row with quantity times price', () => {
  const trace = run('{"Sales":[{"sale_id":1,"product_id":4,"user_id":2,"quantity":3}],"Product":[{"product_id":4,"price":7}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 2, spending: 21 }])
})

test('2329 rejects a product row without a price', () => {
  assert.throws(() => parseInput('{"Sales":[{"sale_id":1,"product_id":1,"user_id":1,"quantity":1}],"Product":[{"product_id":1}]}'))
})
