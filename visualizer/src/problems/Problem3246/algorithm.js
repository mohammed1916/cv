// Teaching model written for this visualizer, with invented sample rows.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the team statistics table.' },
  { id: 'points', label: 'Points', description: 'Score each team: 3 per win plus 1 per draw.' },
  { id: 'rank', label: 'Rank', description: 'Teams with equal points share a position; the next position skips ahead.' },
  { id: 'output', label: 'Result', description: 'Order by position, then by team name.' },
]

export const code = `WITH scored AS (
  SELECT team_id, team_name, 3 * wins + draws AS points
  FROM TeamStats
),
ranked AS (
  SELECT team_id, team_name, points,
    RANK() OVER (ORDER BY points DESC) AS position
  FROM scored
)
SELECT team_id, team_name, points, position
FROM ranked
ORDER BY position, team_name`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def premier_table(team_stats):
    t = team_stats.copy()
    t['points'] = 3 * t['wins'] + t['draws']
    t['position'] = t['points'].rank(method='min', ascending=False).astype(int)
    return t[['team_id', 'team_name', 'points', 'position']].sort_values(['position', 'team_name'])
`

const lookupCode = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`No SQL line contains: ${text}`)
  return index + 1
}
const lookupPython = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains: ${text}`)
  return index + 1
}

const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.TeamStats)) throw new Error('Use an object with a TeamStats list.')
  if (input.TeamStats.length > 8) throw new Error('Use at most 8 teams.')
  const ids = new Set()
  for (const t of input.TeamStats) {
    if (!Number.isInteger(t.team_id) || ids.has(t.team_id)) throw new Error('Each team needs a unique integer team_id.')
    ids.add(t.team_id)
    if (typeof t.team_name !== 'string' || t.team_name === '') throw new Error('Each team needs a team_name.')
    for (const k of ['matches_played', 'wins', 'draws', 'losses']) {
      if (!Number.isInteger(t[k]) || t[k] < 0) throw new Error(`${k} must be a whole number of at least 0.`)
    }
    if (t.wins + t.draws + t.losses !== t.matches_played) throw new Error(`${t.team_name}: wins, draws and losses must add up to matches_played.`)
  }
  return input
}

export function buildTrace(input) {
  const teams = input.TeamStats.map(t => ({ team_id: t.team_id, team_name: t.team_name, wins: t.wins, draws: t.draws }))
  const frames = []
  const snapshot = list => list.map(r => ({ ...r }))
  const push = (phase, sqlText, pyText, message, rows) => frames.push({
    phase, activeLine: lookupCode(sqlText), pythonLine: lookupPython(pyText), message, rows: snapshot(rows),
  })

  push('load', 'FROM TeamStats', 'team_stats.copy', `Load ${count(teams.length, 'team')}.`, teams)

  const scored = teams.map(t => ({ team_id: t.team_id, team_name: t.team_name, points: 3 * t.wins + t.draws }))
  for (const row of scored) {
    push('points', '3 * wins + draws', "t['points'] =", `${row.team_name} has ${row.points} points from ${teams.find(t => t.team_id === row.team_id).wins} wins and ${teams.find(t => t.team_id === row.team_id).draws} draws.`, scored)
  }

  // RANK(): a team's position is 1 plus the number of teams with strictly more points.
  const byPoints = [...scored].sort((a, b) => b.points - a.points || a.team_id - b.team_id)
  const positioned = []
  for (const row of byPoints) {
    const position = 1 + byPoints.filter(other => other.points > row.points).length
    positioned.push({ ...row, position })
    push('rank', 'RANK() OVER', "rank(method='min'", `${row.team_name} with ${row.points} points takes position ${position}.`, [...positioned, ...byPoints.slice(positioned.length)])
  }

  const result = [...positioned].sort((a, b) => a.position - b.position || a.team_name.localeCompare(b.team_name))
  push('output', 'ORDER BY position, team_name', "sort_values(['position', 'team_name'])", `Return ${count(result.length, 'row')} ordered by position, then team name.`, result)
  return { input, result, frames }
}
