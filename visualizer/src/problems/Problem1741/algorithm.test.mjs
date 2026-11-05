import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, sql, python, pythonLineMap } from './algorithm.js'

test('1741 examples, code, sql and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 6)
  assert.ok(sql.includes('SUM(out_time - in_time)'))
  assert.ok(python.includes('def totalTimeSpent'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1741 sums the stays per employee and day', () => {
  const result = buildTrace(parseInput(examples[0].input)).result
  assert.deepEqual(result.find(r => r.emp_id === 3 && r.day === '2026-02-01'), { day: '2026-02-01', emp_id: 3, total_time: 15 })
  assert.equal(result.length, 3)
})

test('1741 rejects invalid entries', () => {
  assert.throws(() => parseInput('[{"emp_id":1,"event_day":"2026-01-01","in_time":5,"out_time":5}]'))
})
