import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('1303 each employee gets the size of their team', () => {
  // Team 40 has three employees, team 50 has two, team 60 has one.
  assert.deepEqual(run.result, [
    { employee_id: 11, team_size: 3 },
    { employee_id: 12, team_size: 3 },
    { employee_id: 13, team_size: 3 },
    { employee_id: 14, team_size: 2 },
    { employee_id: 15, team_size: 1 },
    { employee_id: 16, team_size: 2 },
  ])
})

test('1303 frame invariants hold', () => {
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

test('1303 rejects duplicate employee ids', () => {
  assert.throws(() => parseInput('{"employee":[{"employee_id":1,"team_id":1},{"employee_id":1,"team_id":2}]}'))
})
