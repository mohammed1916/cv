import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('2173 longest winning streaks match hand-computed runs', () => {
  // Player 1: W W L W W W gives 3; player 2: D W gives 1; player 3: L gives 0.
  assert.deepEqual(run.result, [
    { player_id: 1, longest_streak: 3 },
    { player_id: 2, longest_streak: 1 },
    { player_id: 3, longest_streak: 0 },
  ])
})

test('2173 a day with no match does not break a streak', () => {
  const gap = buildTrace(parseInput('{"matches":[{"player_id":7,"match_day":1,"result":"Win"},{"player_id":7,"match_day":9,"result":"Win"}]}'))
  assert.deepEqual(gap.result, [{ player_id: 7, longest_streak: 2 }])
})

test('2173 frame invariants hold', () => {
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

test('2173 rejects an unknown result label', () => {
  assert.throws(() => parseInput('{"matches":[{"player_id":1,"match_day":1,"result":"Tie"}]}'))
})
