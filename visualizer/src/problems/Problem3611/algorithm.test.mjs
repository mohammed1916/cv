import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm.js'

const PHASES = new Set(['load', 'compare', 'count', 'flag', 'skip', 'order', 'done'])

function checkFrames(frames) {
  const pyLineCount = python.split('\n').length
  for (const f of frames) {
    assert.ok(PHASES.has(f.phase), `unknown phase ${f.phase}`)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLineCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
}

test('3611 sample counts overlapping pairs by hand', () => {
  const run = buildTrace(parseInput(SAMPLE_TEXT))
  assert.deepEqual(run.result, [
    { employee_id: 4, name: 'Dee', overlaps: 3 },
    { employee_id: 1, name: 'Ana', overlaps: 2 },
    { employee_id: 3, name: 'Cleo', overlaps: 2 },
  ])
  checkFrames(run.frames)
})

test('3611 touching meetings do not overlap', () => {
  const input = {
    threshold: 1,
    employees: [{ employee_id: 5, name: 'Gus' }],
    meetings: [
      { meeting_id: 1, employee_id: 5, start_hour: 9, end_hour: 10 },
      { meeting_id: 2, employee_id: 5, start_hour: 10, end_hour: 11 },
    ],
  }
  assert.deepEqual(buildTrace(input).result, [])
})

test('3611 rejects a meeting that ends before it starts', () => {
  assert.throws(() => parseInput('{"threshold":1,"employees":[],"meetings":[{"meeting_id":1,"employee_id":1,"start_hour":11,"end_hour":9}]}'))
})
