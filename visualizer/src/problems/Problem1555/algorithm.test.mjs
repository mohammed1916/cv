import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"users":[{"user_id":1,"user_name":"Alice","credit":100},{"user_id":2,"user_name":"Bob","credit":50},{"user_id":3,"user_name":"Cara","credit":20}],"transactions":[{"trans_id":1,"paid_by":1,"paid_to":2,"amount":30},{"trans_id":2,"paid_by":2,"paid_to":3,"amount":90}]}'
const EXPECTED = [
  { user_id: 1, user_name: 'Alice', credit: 70, credit_limit_breached: 'No' },
  { user_id: 2, user_name: 'Bob', credit: -10, credit_limit_breached: 'Yes' },
  { user_id: 3, user_name: 'Cara', credit: 110, credit_limit_breached: 'No' },
]

test('1555 final credits match the hand-computed transfers', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1555 frame invariants hold', () => {
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

test('1555 a user with no transfers keeps the stored credit', () => {
  const { result } = buildTrace(parseInput('{"users":[{"user_id":5,"user_name":"Eve","credit":-4}],"transactions":[]}'))
  assert.deepEqual(result, [{ user_id: 5, user_name: 'Eve', credit: -4, credit_limit_breached: 'Yes' }])
})
