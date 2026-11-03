import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"sales":[{"sale_id":1,"product_name":"  Apple ","sale_date":"2020-05-01"},{"sale_id":2,"product_name":"apple","sale_date":"2020-05-09"},{"sale_id":3,"product_name":"Banana","sale_date":"2020-06-15"},{"sale_id":4,"product_name":"APPLE ","sale_date":"2020-06-02"}]}'
const EXPECTED = [
  { product_name: 'apple', sale_date: '2020-05', total: 2 },
  { product_name: 'apple', sale_date: '2020-06', total: 1 },
  { product_name: 'banana', sale_date: '2020-06', total: 1 },
]

test('1543 totals match the hand-computed groups', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1543 frame invariants hold', () => {
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

test('1543 rejects a malformed sale date', () => {
  assert.throws(() => parseInput('{"sales":[{"sale_id":1,"product_name":"a","sale_date":"May"}]}'))
})
