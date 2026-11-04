import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const totalsOf = rows => buildTrace(parseInput(JSON.stringify(rows))).result

test('2893 sums each six-minute interval', () => {
  assert.deepEqual(totalsOf(sample), [
    { interval_no: 1, total_orders: 15 },
    { interval_no: 2, total_orders: 18 },
  ])
})

test('2893 keeps zero-order minutes inside their interval', () => {
  const rows = Array.from({ length: 6 }, (_, i) => ({ minute: i + 1, order_count: 0 }))
  assert.deepEqual(totalsOf(rows), [{ interval_no: 1, total_orders: 0 }])
})

test('2893 rejects bad row counts and minutes', () => {
  assert.throws(() => parseInput('[{"minute":1,"order_count":2}]'))
  const shifted = Array.from({ length: 6 }, (_, i) => ({ minute: i + 2, order_count: 1 }))
  assert.throws(() => parseInput(JSON.stringify(shifted)))
})

test('2893 frame invariants hold', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace(parseInput(JSON.stringify(sample)))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
