import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('1204 the last fitting person is Cara', () => {
  // Running totals 200, 500, 950, then Dan's 1200 overflows the 1000 limit.
  assert.deepEqual(run.result, [{ person_name: 'Cara' }])
})

test('1204 a lighter later person cannot skip past an overflow', () => {
  const stop = run.frames.find(f => f.phase === 'stop')
  assert.equal(stop.rows.at(-1).person_name, 'Dan')
  assert.equal(stop.rows.at(-1).running, 1200)
})

test('1204 frame invariants hold', () => {
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

test('1204 rejects a non-positive weight', () => {
  assert.throws(() => parseInput('{"queue":[{"person_name":"Zed","weight":0,"turn":1}]}'))
})
