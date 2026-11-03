import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('1205 groups from both streams are merged with zero fill', () => {
  assert.deepEqual(run.result, [
    { month: '2019-05', country: 'US', approved_count: 1, approved_amount: 1000, chargeback_count: 0, chargeback_amount: 0 },
    { month: '2019-06', country: 'DE', approved_count: 1, approved_amount: 500, chargeback_count: 0, chargeback_amount: 0 },
    { month: '2019-06', country: 'US', approved_count: 1, approved_amount: 700, chargeback_count: 2, chargeback_amount: 1700 },
  ])
})

test('1205 declined transactions do not appear in approved counts', () => {
  assert.equal(run.result.find(r => r.month === '2019-05' && r.country === 'US').approved_count, 1)
})

test('1205 frame invariants hold', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).rows, run.result)
})

test('1205 rejects a chargeback for an unknown transaction', () => {
  assert.throws(() => parseInput('{"transactions":[],"chargebacks":[{"trans_id":9,"trans_date":"2019-06-01"}]}'))
})
