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

const ROWS = [[1,1,"2019-03-01"],[1,1,"2019-06-01"],[1,1,"2019-09-01"],[1,1,"2020-01-10"],[1,1,"2020-02-10"],[1,1,"2020-03-10"],[2,5,"2019-01-01"],[2,1,"2019-02-01"],[2,1,"2019-03-01"],[2,1,"2021-01-01"],[2,1,"2021-02-01"],[2,1,"2021-03-01"],[3,1,"2020-01-01"],[3,1,"2020-02-01"],[3,1,"2020-03-01"],[3,1,"2020-04-01"],[3,1,"2021-05-01"],[3,1,"2022-01-01"],[3,1,"2022-02-01"],[3,1,"2022-03-01"],[4,1,"2021-01-01"],[4,1,"2022-01-01"],[4,1,"2023-01-01"],[4,1,"2021-06-01"],[4,1,"2021-09-01"],[4,1,"2022-06-01"],[4,1,"2022-09-01"]]
const orders = rows => JSON.stringify({ Orders: rows.map((r, i) => ({ order_id: i + 1, product_id: r[0], quantity: r[1], purchase_date: r[2] })) })

test('2292 keeps products with busy years in a row', () => {
  const trace = run(orders(ROWS))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ product_id: 1 }, { product_id: 4 }])
})

test('2292 does not count a gap between busy years', () => {
  const trace = run(orders([[9, 1, '2019-01-01'], [9, 1, '2019-02-01'], [9, 1, '2019-03-01'], [9, 1, '2021-01-01'], [9, 1, '2021-02-01'], [9, 1, '2021-03-01']]))
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('2292 rejects an order without quantity', () => {
  assert.throws(() => parseInput('{"Orders":[{"order_id":1,"product_id":1,"purchase_date":"2019-01-01"}]}'))
})
