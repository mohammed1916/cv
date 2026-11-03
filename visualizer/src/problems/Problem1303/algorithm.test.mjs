import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('1303 each employee gets the size of their team', () => {
  // Team 8 has three employees, team 7 has two, team 2 has one.
  assert.deepEqual(run.result, [
    { employee_id: 1, team_size: 3 },
    { employee_id: 2, team_size: 3 },
    { employee_id: 3, team_size: 3 },
    { employee_id: 4, team_size: 2 },
    { employee_id: 5, team_size: 1 },
    { employee_id: 6, team_size: 2 },
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
