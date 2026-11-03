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

test('3166 sample totals fees and picks the busiest lot per car', () => {
  const trace = run('{"ParkingTransactions":[{"transaction_id":1,"car_id":1,"lot_id":1,"entry_time":0,"exit_time":60,"fee_paid":5},{"transaction_id":2,"car_id":1,"lot_id":2,"entry_time":100,"exit_time":130,"fee_paid":2.5},{"transaction_id":3,"car_id":1,"lot_id":1,"entry_time":200,"exit_time":230,"fee_paid":2},{"transaction_id":4,"car_id":2,"lot_id":3,"entry_time":0,"exit_time":40,"fee_paid":4},{"transaction_id":5,"car_id":2,"lot_id":2,"entry_time":50,"exit_time":60,"fee_paid":1}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { car_id: 1, total_fee_paid: 9.5, average_hourly_fee: 4.75, most_time_lot: 1 },
    { car_id: 2, total_fee_paid: 5, average_hourly_fee: 6, most_time_lot: 3 },
  ])
})

test('3166 equal lot minutes go to the smaller lot id', () => {
  const trace = run('{"ParkingTransactions":[{"transaction_id":1,"car_id":9,"lot_id":5,"entry_time":0,"exit_time":30,"fee_paid":1},{"transaction_id":2,"car_id":9,"lot_id":4,"entry_time":60,"exit_time":90,"fee_paid":1}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ car_id: 9, total_fee_paid: 2, average_hourly_fee: 2, most_time_lot: 4 }])
})

test('3166 rounds the hourly rate to two decimals', () => {
  const trace = run('{"ParkingTransactions":[{"transaction_id":1,"car_id":3,"lot_id":1,"entry_time":0,"exit_time":30,"fee_paid":1}]}')
  checkFrames(trace)
  assert.equal(trace.result[0].average_hourly_fee, 2)
  assert.throws(() => parseInput('{"ParkingTransactions":[{"transaction_id":1,"car_id":3,"lot_id":1,"entry_time":30,"exit_time":30,"fee_paid":1}]}'))
})
