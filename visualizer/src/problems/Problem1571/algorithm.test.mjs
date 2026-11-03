import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"warehouse":[{"name":"North","product_id":1,"units":2},{"name":"North","product_id":2,"units":1},{"name":"South","product_id":1,"units":3}],"products":[{"product_id":1,"product_name":"Box","Width":2,"Length":3,"Height":4},{"product_id":2,"product_name":"Crate","Width":1,"Length":1,"Height":5}]}'
const EXPECTED = [
  { warehouse_name: 'North', volume: 53 },
  { warehouse_name: 'South', volume: 72 },
]

test('1571 volumes match the hand-computed sums', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1571 frame invariants hold', () => {
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

test('1571 rejects a non-positive dimension', () => {
  assert.throws(() => parseInput('{"warehouse":[],"products":[{"product_id":1,"Width":0,"Length":1,"Height":1}]}'))
})
