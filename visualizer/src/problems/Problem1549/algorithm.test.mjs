import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"customers":[{"customer_id":1,"name":"Ana"},{"customer_id":2,"name":"Ben"}],"products":[{"product_id":10,"product_name":"Keyboard","price":30},{"product_id":20,"product_name":"Mouse","price":12},{"product_id":30,"product_name":"Dock","price":80}],"orders":[{"order_id":101,"order_date":"2021-01-05","customer_id":1,"product_id":10},{"order_id":102,"order_date":"2021-02-10","customer_id":2,"product_id":10},{"order_id":103,"order_date":"2021-02-10","customer_id":1,"product_id":10},{"order_id":104,"order_date":"2021-01-20","customer_id":2,"product_id":20},{"order_id":105,"order_date":"2021-03-01","customer_id":1,"product_id":20}]}'
const EXPECTED = [
  { product_name: 'Keyboard', product_id: 10, order_id: 102, order_date: '2021-02-10' },
  { product_name: 'Keyboard', product_id: 10, order_id: 103, order_date: '2021-02-10' },
  { product_name: 'Mouse', product_id: 20, order_id: 105, order_date: '2021-03-01' },
]

test('1549 keeps every tied newest order and no product without orders', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1549 frame invariants hold', () => {
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

test('1549 rejects a product without a name', () => {
  assert.throws(() => parseInput('{"orders":[],"products":[{"product_id":1}]}'))
})
