import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"Product":[{"product_id":1,"name":"LC Phone"},{"product_id":2,"name":"LC T-Shirt"},{"product_id":3,"name":"LC Book"}],"Invoice":[{"invoice_id":1,"product_id":1,"rest":10,"paid":30,"canceled":15,"refunded":20},{"invoice_id":2,"product_id":1,"rest":20,"paid":40,"canceled":30,"refunded":10},{"invoice_id":3,"product_id":2,"rest":20,"paid":40,"canceled":20,"refunded":20}]}'
const EXPECTED = [
  { name: 'LC Book', rest: 0, paid: 0, canceled: 0, refunded: 0 },
  { name: 'LC Phone', rest: 30, paid: 70, canceled: 45, refunded: 30 },
  { name: 'LC T-Shirt', rest: 20, paid: 40, canceled: 20, refunded: 20 },
]

test('1677 sums per product and keeps products without invoices as zeros', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1677 frame invariants hold', () => {
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

test('1677 rejects a negative amount', () => {
  assert.throws(() => parseInput('{"Product":[{"product_id":1,"name":"A"}],"Invoice":[{"invoice_id":1,"product_id":1,"rest":-1,"paid":0,"canceled":0,"refunded":0}]}'))
})
