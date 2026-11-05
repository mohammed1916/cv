import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, sql, python, pythonLineMap } from './algorithm.js'

test('1693 examples, code, sql and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 8)
  assert.ok(sql.includes('COUNT(DISTINCT lead_id)'))
  assert.ok(python.includes('def dailyLeadsAndPartners'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1693 counts distinct leads and partners per date and product', () => {
  const rows = JSON.parse(examples[0].input)
  const result = buildTrace(rows).result
  assert.deepEqual(result.find(r => r.date_id === '2026-01-01' && r.make_name === 'pear'), { date_id: '2026-01-01', make_name: 'pear', unique_leads: 1, unique_partners: 2 })
  assert.equal(result.length, 3)
})

test('1693 rejects invalid rows', () => {
  assert.throws(() => parseInput('[{"date_id":"2026-1-1","make_name":"pear","lead_id":1,"partner_id":2}]'))
  assert.throws(() => parseInput('[{"date_id":"2026-01-01","make_name":"Pear","lead_id":1,"partner_id":2}]'))
})
