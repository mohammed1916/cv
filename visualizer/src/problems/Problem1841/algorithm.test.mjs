import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const SAMPLE = '{"Teams":[{"team_id":1,"team_name":"Ash"},{"team_id":2,"team_name":"Birch"},{"team_id":3,"team_name":"Cedar"},{"team_id":4,"team_name":"Dune"}],"Matches":[{"home_team_id":1,"away_team_id":2,"home_team_goals":2,"away_team_goals":1},{"home_team_id":2,"away_team_id":3,"home_team_goals":1,"away_team_goals":1},{"home_team_id":3,"away_team_id":1,"home_team_goals":0,"away_team_goals":3}]}'

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('1841 sample ranks Ash first on six points, then Birch and Cedar, with Dune last', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { team_name: 'Ash', matches_played: 2, points: 6, goals_for: 5, goals_against: 1, goal_diff: 4 },
    { team_name: 'Birch', matches_played: 2, points: 1, goals_for: 2, goals_against: 3, goal_diff: -1 },
    { team_name: 'Cedar', matches_played: 2, points: 1, goals_for: 1, goals_against: 4, goal_diff: -3 },
    { team_name: 'Dune', matches_played: 0, points: 0, goals_for: 0, goals_against: 0, goal_diff: 0 },
  ])
})

test('1841 a draw gives one point to each side and no goal difference', () => {
  const trace = buildTrace(parseInput('{"Teams":[{"team_id":5,"team_name":"Elm"},{"team_id":6,"team_name":"Fir"}],"Matches":[{"home_team_id":5,"away_team_id":6,"home_team_goals":0,"away_team_goals":0}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result.map(row => [row.team_name, row.points, row.goal_diff]), [['Elm', 1, 0], ['Fir', 1, 0]])
})

test('1841 rejects a match that names an unknown team', () => {
  assert.throws(() => parseInput('{"Teams":[{"team_id":1,"team_name":"Ash"}],"Matches":[{"home_team_id":1,"away_team_id":9,"home_team_goals":1,"away_team_goals":0}]}'))
})
