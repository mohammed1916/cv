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

test('four Fridays in November give weeks 1 to 4 and the December Friday is skipped', () => {
  const trace = run('{"Purchases":[{"user_id":1,"purchase_date":"2023-11-03","amount_spend":40},{"user_id":2,"purchase_date":"2023-11-03","amount_spend":25},{"user_id":1,"purchase_date":"2023-11-10","amount_spend":15},{"user_id":3,"purchase_date":"2023-11-08","amount_spend":99},{"user_id":4,"purchase_date":"2023-11-17","amount_spend":60},{"user_id":2,"purchase_date":"2023-11-17","amount_spend":5},{"user_id":5,"purchase_date":"2023-12-01","amount_spend":70},{"user_id":3,"purchase_date":"2023-11-24","amount_spend":30}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { week_of_month: 1, purchase_date: '2023-11-03', total_amount: 65 },
    { week_of_month: 2, purchase_date: '2023-11-10', total_amount: 15 },
    { week_of_month: 3, purchase_date: '2023-11-17', total_amount: 65 },
    { week_of_month: 4, purchase_date: '2023-11-24', total_amount: 30 },
  ])
})

test('a November with no Friday purchases returns an empty result', () => {
  const trace = run('{"Purchases":[{"user_id":1,"purchase_date":"2023-11-08","amount_spend":12},{"user_id":2,"purchase_date":"2023-11-30","amount_spend":7}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('rejects a date that is not in YYYY-MM-DD form', () => {
  assert.throws(() => parseInput('{"Purchases":[{"user_id":1,"purchase_date":"11/03/2023","amount_spend":12}]}'))
})
