import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('2752 result matches the hand-computed sample', () => {
  assert.deepEqual(run.result, [
    { customer_id: 2, longest_run: 4 },
    { customer_id: 4, longest_run: 4 },
  ])
})

test('2752 rejects malformed input', () => {
  assert.throws(() => parseInput(JSON.stringify({ transactions: [{ transaction_id: 1, customer_id: 1, transaction_date: '2026/01/01', amount: 1 }] })))
})

test('2752 frame invariants hold', () => {
  const ids = new Set(phases.map(p => p.id))
  assert.ok(run.frames.length > 0)
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
