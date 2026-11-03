import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const run = text => buildTrace(parseInput(text))
const pythonLineCount = python.split('\n').length

function checkFrames(result) {
  const phaseIds = new Set(phases.map(phase => phase.id))
  assert.ok(result.frames.length > 0)
  for (const frame of result.frames) {
    assert.ok(phaseIds.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonLineCount)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
  }
  assert.deepEqual(result.frames.at(-1).rows, result.result)
}

const sample = JSON.stringify({
  teams: [{ team_id: 3, team_name: 'Ash' }, { team_id: 5, team_name: 'Birch' }, { team_id: 6, team_name: 'Cedar' }, { team_id: 8, team_name: 'Dune' }],
  matches: [
    { match_id: 1, host_team: 3, guest_team: 5, host_goals: 2, guest_goals: 2 },
    { match_id: 2, host_team: 6, guest_team: 3, host_goals: 0, guest_goals: 3 },
    { match_id: 3, host_team: 5, guest_team: 6, host_goals: 1, guest_goals: 0 },
  ],
})

test('1212 sample standings match the hand computation', () => {
  const result = run(sample)
  assert.deepEqual(result.result, [
    { team_id: 3, team_name: 'Ash', num_points: 4 },
    { team_id: 5, team_name: 'Birch', num_points: 4 },
    { team_id: 6, team_name: 'Cedar', num_points: 0 },
    { team_id: 8, team_name: 'Dune', num_points: 0 },
  ])
  checkFrames(result)
})

test('1212 teams without matches stay at zero and ties break by team id', () => {
  const result = run('{"teams":[{"team_id":2,"team_name":"B"},{"team_id":1,"team_name":"A"}],"matches":[]}')
  assert.deepEqual(result.result.map(row => row.team_id), [1, 2])
  assert.deepEqual(result.result.map(row => row.num_points), [0, 0])
  checkFrames(result)
})

test('1212 total points equal 3 per decisive match and 2 per draw', () => {
  const result = run(sample)
  const total = result.result.reduce((sum, row) => sum + row.num_points, 0)
  assert.equal(total, 2 + 3 + 3)
})

test('1212 rejects a match between one team and itself or an unknown team', () => {
  assert.throws(() => parseInput('{"teams":[{"team_id":1,"team_name":"A"}],"matches":[{"match_id":1,"host_team":1,"guest_team":1,"host_goals":0,"guest_goals":0}]}'))
  assert.throws(() => parseInput('{"teams":[{"team_id":1,"team_name":"A"}],"matches":[{"match_id":1,"host_team":1,"guest_team":9,"host_goals":0,"guest_goals":0}]}'))
})
