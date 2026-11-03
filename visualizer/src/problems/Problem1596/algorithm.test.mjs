import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"customers":[{"customer_id":1,"name":"Ana"},{"customer_id":2,"name":"Ben"},{"customer_id":3,"name":"Cy"}],"products":[{"product_id":10,"product_name":"Keyboard","price":30},{"product_id":20,"product_name":"Mouse","price":12},{"product_id":30,"product_name":"Dock","price":80}],"orders":[{"order_id":1,"order_date":"2020-01-01","customer_id":1,"product_id":10},{"order_id":2,"order_date":"2020-01-05","customer_id":1,"product_id":10},{"order_id":3,"order_date":"2020-01-09","customer_id":1,"product_id":20},{"order_id":4,"order_date":"2020-02-01","customer_id":1,"product_id":20},{"order_id":5,"order_date":"2020-02-02","customer_id":2,"product_id":30},{"order_id":6,"order_date":"2020-02-03","customer_id":2,"product_id":10},{"order_id":7,"order_date":"2020-02-04","customer_id":3,"product_id":20}]}'
const EXPECTED = [
  { customer_id: 1, product_id: 10, product_name: 'Keyboard' },
  { customer_id: 1, product_id: 20, product_name: 'Mouse' },
  { customer_id: 2, product_id: 10, product_name: 'Keyboard' },
  { customer_id: 2, product_id: 30, product_name: 'Dock' },
  { customer_id: 3, product_id: 20, product_name: 'Mouse' },
]

test('1596 keeps every tied favourite product per customer', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1596 frame invariants hold', () => {
  const { frames } = buildTrace(parseInput(SAMPLE))
  const ids = new Set(phases.map(p => p.id))
  const pyCount = python.split('\n').length
  assert.ok(frames.length > 0)
  for (const f of frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.output))
  }
  assert.equal(frames.at(-1).phase, 'done')
  assert.deepEqual(frames.at(-1).output, EXPECTED)
})

test('1596 rejects a missing product id', () => {
  assert.throws(() => parseInput('{"orders":[{"order_id":1,"customer_id":1}],"products":[]}'))
})
