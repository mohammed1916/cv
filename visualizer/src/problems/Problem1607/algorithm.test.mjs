import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"customer":[{"customer_id":1,"customer_name":"Noor"}],"seller":[{"seller_id":1,"seller_name":"Ilse"},{"seller_id":2,"seller_name":"Jun"},{"seller_id":3,"seller_name":"Kofi"},{"seller_id":4,"seller_name":"Mira"}],"orders":[{"order_id":1,"sale_date":"2020-03-01","order_cost":1000,"customer_id":1,"seller_id":2},{"order_id":2,"sale_date":"2019-12-30","order_cost":500,"customer_id":1,"seller_id":1},{"order_id":3,"sale_date":"2021-01-03","order_cost":300,"customer_id":1,"seller_id":3}]}'
const EXPECTED = [
  { seller_name: 'Ilse' },
  { seller_name: 'Kofi' },
  { seller_name: 'Mira' },
]

test('1607 sellers with no 2020 sale, sorted by name', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1607 frame invariants hold', () => {
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

test('1607 a 2020 sale in any month excludes the seller', () => {
  const { result } = buildTrace(parseInput('{"seller":[{"seller_id":1,"seller_name":"Solo"}],"orders":[{"order_id":1,"sale_date":"2020-12-31","seller_id":1}]}'))
  assert.deepEqual(result, [])
})
