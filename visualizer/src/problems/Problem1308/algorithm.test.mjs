import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('1308 running totals per gender in date order', () => {
  // Female: 10, then 10 + 6 = 16, then 16 + 2 = 18. Male: 4, then 4 + 7 = 11, then 11 + 1 = 12.
  assert.deepEqual(run.result, [
    { gender: 'female', day: '2019-01-01', total: 10 },
    { gender: 'female', day: '2019-01-03', total: 16 },
    { gender: 'female', day: '2019-01-04', total: 18 },
    { gender: 'male', day: '2019-01-01', total: 4 },
    { gender: 'male', day: '2019-01-02', total: 11 },
    { gender: 'male', day: '2019-01-03', total: 12 },
  ])
})

test('1308 frame invariants hold', () => {
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

test('1308 rejects a non-numeric score', () => {
  assert.throws(() => parseInput('{"scores":[{"gender":"x","day":"2019-01-01","score_points":"5"}]}'))
})
