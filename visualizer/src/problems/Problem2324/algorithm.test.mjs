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

test('2324 keeps every product tied for each user top spending', () => {
  const trace = run('{"Product":[{"product_id":1,"price":10},{"product_id":2,"price":5},{"product_id":3,"price":4}],"Sales":[{"sale_id":1,"product_id":1,"user_id":1,"quantity":2},{"sale_id":2,"product_id":2,"user_id":1,"quantity":4},{"sale_id":3,"product_id":3,"user_id":1,"quantity":1},{"sale_id":4,"product_id":2,"user_id":2,"quantity":1},{"sale_id":5,"product_id":1,"user_id":2,"quantity":1},{"sale_id":6,"product_id":1,"user_id":2,"quantity":1}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { user_id: 1, product_id: 1 },
    { user_id: 1, product_id: 2 },
    { user_id: 2, product_id: 1 },
  ])
})

test('2324 returns the only product for a single purchase', () => {
  const trace = run('{"Product":[{"product_id":1,"price":5}],"Sales":[{"sale_id":1,"product_id":1,"user_id":3,"quantity":1}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 3, product_id: 1 }])
})

test('2324 rejects a sale whose product is not priced', () => {
  assert.throws(() => run('{"Sales":[{"sale_id":1,"product_id":7,"user_id":1,"quantity":1}],"Product":[{"product_id":1,"price":5}]}'))
})
