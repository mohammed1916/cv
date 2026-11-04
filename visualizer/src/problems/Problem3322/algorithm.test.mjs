import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, compareTeams, parseInput, code, python, sql, phases } from './algorithm.js'

const team = (season_id, team_id, team_name, wins, draws, losses, goals_for, goals_against) => ({
  season_id, team_id, team_name, matches_played: wins + draws + losses, wins, draws, losses, goals_for, goals_against,
})
const main = [
  team(2031, 1, 'Harbour Town', 20, 9, 9, 66, 40), team(2031, 2, 'Ironbridge', 21, 6, 11, 60, 41),
  team(2031, 3, 'Kestrel Rovers', 18, 12, 8, 55, 38), team(2031, 4, 'Alder Vale', 18, 12, 8, 50, 33),
  team(2030, 1, 'Harbour Town', 15, 5, 18, 44, 50), team(2030, 5, 'Moss Bay', 25, 3, 10, 70, 39),
]

test('3322 hand-computed table covers every tie-break', () => {
  assert.deepEqual(buildTrace({ season_stats: main }).result, [
    { season_id: 2030, team_id: 5, team_name: 'Moss Bay', points: 78, goal_difference: 31, position: 1 },
    { season_id: 2030, team_id: 1, team_name: 'Harbour Town', points: 50, goal_difference: -6, position: 2 },
    { season_id: 2031, team_id: 1, team_name: 'Harbour Town', points: 69, goal_difference: 26, position: 1 },
    { season_id: 2031, team_id: 2, team_name: 'Ironbridge', points: 69, goal_difference: 19, position: 2 },
    { season_id: 2031, team_id: 4, team_name: 'Alder Vale', points: 66, goal_difference: 17, position: 3 },
    { season_id: 2031, team_id: 3, team_name: 'Kestrel Rovers', points: 66, goal_difference: 17, position: 4 },
  ])
})

test('3322 a team alone in its season is first, whatever its record', () => {
  assert.deepEqual(buildTrace({ season_stats: [team(2050, 3, 'Solent United', 0, 0, 2, 1, 5)] }).result, [
    { season_id: 2050, team_id: 3, team_name: 'Solent United', points: 0, goal_difference: -4, position: 1 },
  ])
})

test('3322 the ladder stops at the rung that decides', () => {
  const scored = (team_name, points, goal_difference) => ({ team_name, points, goal_difference })
  const states = (a, b) => compareTeams(a, b).ladder.map(r => r.state)
  assert.deepEqual(states(scored('B', 9, 0), scored('A', 3, 5)), ['decides', 'unused', 'unused'])
  assert.deepEqual(states(scored('B', 9, 0), scored('A', 9, 5)), ['tie', 'decides', 'unused'])
  assert.deepEqual(states(scored('B', 9, 5), scored('A', 9, 5)), ['tie', 'tie', 'decides'])
  assert.equal(compareTeams(scored('B', 9, 5), scored('A', 9, 5)).winner, 'b')
})

test('3322 parseInput validates the table', () => {
  const text = rows => JSON.stringify({ season_stats: rows })
  assert.equal(parseInput(text(main)).season_stats.length, 6)
  assert.throws(() => parseInput(text([])))
  assert.throws(() => parseInput(text([main[0], main[0]])))
  assert.throws(() => parseInput(text([main[0], { ...main[1], team_name: 'harbour town' }])))
  assert.throws(() => parseInput(text([{ ...main[0], wins: -1 }])))
  assert.doesNotThrow(() => parseInput(text([main[0], main[4]])))
})

test('3322 random tables match a count-the-teams-above oracle', () => {
  let seed = 3322
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 500; t++) {
    const size = 1 + rnd(12)
    const rows = Array.from({ length: size }, (_, i) => team(2000 + rnd(3), i, `T${String.fromCharCode(97 + i)}`, rnd(3), rnd(3), rnd(3), rnd(4), rnd(4)))
    const beats = (a, b) => {
      const pa = a.wins * 3 + a.draws, pb = b.wins * 3 + b.draws
      const ga = a.goals_for - a.goals_against, gb = b.goals_for - b.goals_against
      return pa !== pb ? pa > pb : ga !== gb ? ga > gb : a.team_name < b.team_name
    }
    const { result } = buildTrace({ season_stats: rows })
    assert.equal(result.length, rows.length)
    for (const row of result) {
      const source = rows.find(r => r.team_id === row.team_id)
      const above = rows.filter(r => r.season_id === source.season_id && beats(r, source)).length
      assert.equal(row.position, above + 1)
    }
    for (let i = 1; i < result.length; i++) {
      const a = result[i - 1], b = result[i]
      assert.ok(a.season_id < b.season_id || (a.season_id === b.season_id && a.position < b.position))
    }
  }
})

test('3322 frames point at the query and Python line that do the work', () => {
  const { frames } = buildTrace({ season_stats: main })
  const pyLines = python.trim().split('\n')
  const sqlLines = sql.split('\n')
  const ids = new Set(phases.map(p => p.id))
  assert.equal(code.length, sqlLines.length)
  for (const f of frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pyLines[f.pythonLine - 1].trim().length > 0)
    assert.ok(f.message.length > 0)
  }
  const first = phase => frames.find(f => f.phase === phase)
  assert.ok(sqlLines[first('points').activeLine - 1].includes('wins * 3'))
  assert.ok(pyLines[first('points').pythonLine - 1].includes('team["wins"] * 3'))
  assert.ok(sqlLines[first('compare').activeLine - 1].includes('ORDER BY points'))
  assert.ok(pyLines[first('position').pythonLine - 1].includes('position'))
  assert.equal(first('points').calc, '20 × 3 + 9 = 69')
  assert.equal(first('difference').calc, '66 − 40 = +26')
  assert.equal(frames.filter(f => f.compare?.deciding === 'team_name').length, 1)
  assert.equal(frames.filter(f => f.compare?.deciding === 'goal_difference').length, 1)
})
