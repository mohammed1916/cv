import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = JSON.stringify({
  Product: [{ product_id: 5, product_name: 'Lamp' }, { product_id: 2, product_name: 'Desk' }, { product_id: 8, product_name: 'Mug' }],
  Sales: [
    { product_id: 5, period_start: '2024-02-27', period_end: '2024-03-02', average_daily_sales: 10 },
    { product_id: 2, period_start: '2025-12-30', period_end: '2026-01-02', average_daily_sales: 3 },
    { product_id: 5, period_start: '2025-01-01', period_end: '2025-01-01', average_daily_sales: 7 },
  ],
})

function checkFrames(run) {
  const phaseIds = phases.map(p => p.id)
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(phaseIds.includes(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.split('\n').length)
    assert.ok(Array.isArray(f.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('1384 sample splits periods across years, with 2024 as a leap year', () => {
  const run = buildTrace(parseInput(sample))
  assert.deepEqual(run.result, [
    { product_id: 2, product_name: 'Desk', report_year: 2025, total_amount: 6 },
    { product_id: 2, product_name: 'Desk', report_year: 2026, total_amount: 6 },
    { product_id: 5, product_name: 'Lamp', report_year: 2024, total_amount: 50 },
    { product_id: 5, product_name: 'Lamp', report_year: 2025, total_amount: 7 },
  ])
  checkFrames(run)
})

test('1384 a period across a non leap February counts real days only', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Product: [{ product_id: 1, product_name: 'Pen' }],
    Sales: [{ product_id: 1, period_start: '2023-02-28', period_end: '2023-03-01', average_daily_sales: 4 }],
  })))
  assert.deepEqual(run.result, [{ product_id: 1, product_name: 'Pen', report_year: 2023, total_amount: 8 }])
  checkFrames(run)
})

test('1384 products without sales do not appear', () => {
  const run = buildTrace(parseInput(sample))
  assert.equal(run.result.some(row => row.product_id === 8), false)
})

test('1384 rejects a sale whose end is before its start', () => {
  assert.throws(() => parseInput(JSON.stringify({
    Product: [{ product_id: 1, product_name: 'Pen' }],
    Sales: [{ product_id: 1, period_start: '2023-03-01', period_end: '2023-02-01', average_daily_sales: 4 }],
  })))
})
