import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"visits":[{"visit_id":3,"customer_id":14},{"visit_id":4,"customer_id":7},{"visit_id":6,"customer_id":41},{"visit_id":9,"customer_id":7},{"visit_id":10,"customer_id":88},{"visit_id":11,"customer_id":7}],"transactions":[{"transaction_id":21,"visit_id":9,"amount":45},{"transaction_id":22,"visit_id":9,"amount":60},{"transaction_id":23,"visit_id":3,"amount":12},{"transaction_id":24,"visit_id":10,"amount":80}]}'
const EXPECTED = [
  { customer_id: 7, count_no_trans: 2 },
  { customer_id: 41, count_no_trans: 1 },
]

test('1581 counts silent visits; several transactions on one visit do not make it silent', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1581 frame invariants hold', () => {
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

test('1581 a visit with no visits table rows yields no output', () => {
  assert.deepEqual(buildTrace(parseInput('{"visits":[],"transactions":[]}')).result, [])
})
