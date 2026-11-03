import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('2175 rank differences match hand-computed rankings', () => {
  // Before: Bruins 12, Arsenal 10, Dragons 9, Cobras 8. After: Arsenal 13, Bruins 12, Cobras 10, Dragons 10 (name breaks the tie).
  assert.deepEqual(run.result, [
    { name: 'Arsenal', rank_diff: 1 },
    { name: 'Bruins', rank_diff: -1 },
    { name: 'Cobras', rank_diff: 1 },
    { name: 'Dragons', rank_diff: -1 },
  ])
})

test('2175 a team without a change keeps its rank when nothing moves', () => {
  const still = buildTrace(parseInput('{"team_points":[{"team_id":1,"name":"Ants","points":5},{"team_id":2,"name":"Bees","points":3}],"points_change":[]}'))
  assert.deepEqual(still.result, [
    { name: 'Ants', rank_diff: 0 },
    { name: 'Bees', rank_diff: 0 },
  ])
})

test('2175 frame invariants hold', () => {
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

test('2175 rejects a change for an unknown team', () => {
  assert.throws(() => parseInput('{"team_points":[{"team_id":1,"name":"Ants","points":5}],"points_change":[{"team_id":9,"points_change":1}]}'))
})
