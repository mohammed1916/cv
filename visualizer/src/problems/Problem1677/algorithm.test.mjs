import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"Product":[{"product_id":1,"name":"Kettle"},{"product_id":2,"name":"Lamp"},{"product_id":3,"name":"Apron"}],"Invoice":[{"invoice_id":1,"product_id":1,"rest":12,"paid":26,"canceled":14,"refunded":18},{"invoice_id":2,"product_id":1,"rest":22,"paid":38,"canceled":28,"refunded":12},{"invoice_id":3,"product_id":2,"rest":18,"paid":44,"canceled":22,"refunded":16}]}'
const EXPECTED = [
  { name: 'Apron', rest: 0, paid: 0, canceled: 0, refunded: 0 },
  { name: 'Kettle', rest: 34, paid: 64, canceled: 42, refunded: 30 },
  { name: 'Lamp', rest: 18, paid: 44, canceled: 22, refunded: 16 },
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
