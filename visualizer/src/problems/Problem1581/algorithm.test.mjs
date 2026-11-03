import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"visits":[{"visit_id":1,"customer_id":23},{"visit_id":2,"customer_id":9},{"visit_id":4,"customer_id":30},{"visit_id":5,"customer_id":54},{"visit_id":6,"customer_id":96},{"visit_id":7,"customer_id":54},{"visit_id":8,"customer_id":54}],"transactions":[{"transaction_id":2,"visit_id":5,"amount":310},{"transaction_id":3,"visit_id":5,"amount":300},{"transaction_id":9,"visit_id":5,"amount":200},{"transaction_id":12,"visit_id":1,"amount":910},{"transaction_id":13,"visit_id":2,"amount":970}]}'
const EXPECTED = [
  { customer_id: 30, count_no_trans: 1 },
  { customer_id: 54, count_no_trans: 2 },
  { customer_id: 96, count_no_trans: 1 },
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
