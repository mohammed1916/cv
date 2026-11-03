import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('1194 winners match the hand-computed totals', () => {
  // Player 10 has 12 points, player 40 has 9, and player 50 has zero matches but leads group 3 alone.
  assert.deepEqual(run.result, [
    { group_id: 1, player_id: 10 },
    { group_id: 2, player_id: 40 },
    { group_id: 3, player_id: 50 },
  ])
})

test('1194 frame invariants hold', () => {
  const ids = new Set(phases.map(p => p.id))
  assert.ok(run.frames.length > 0)
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

test('1194 rejects a match that names an unknown player', () => {
  const bad = { ...sample, matches: [{ ...sample.matches[0], first_player: 999 }] }
  assert.throws(() => parseInput(JSON.stringify(bad)))
})
