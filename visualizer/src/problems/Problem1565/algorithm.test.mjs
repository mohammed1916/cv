import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"orders":[{"order_id":1,"order_date":"2020-01-05","customer_id":10,"invoice":30},{"order_id":2,"order_date":"2020-01-20","customer_id":10,"invoice":25},{"order_id":3,"order_date":"2020-01-22","customer_id":11,"invoice":20},{"order_id":4,"order_date":"2020-02-03","customer_id":11,"invoice":45},{"order_id":5,"order_date":"2020-02-03","customer_id":12,"invoice":21},{"order_id":6,"order_date":"2020-02-09","customer_id":12,"invoice":21}]}'
const EXPECTED = [
  { month: '2020-01', order_count: 2, customer_count: 1 },
  { month: '2020-02', order_count: 3, customer_count: 2 },
]

test('1565 counts only invoices strictly above 20', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1565 frame invariants hold', () => {
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

test('1565 rejects a non-numeric invoice', () => {
  assert.throws(() => parseInput('{"orders":[{"order_id":1,"order_date":"2020-01-01","customer_id":1,"invoice":"9"}]}'))
})
