// Knowledge-derived walkthrough: each match yields a points table for both sides, then the totals are joined onto every team so teams without matches keep zero.
export const phases = [
  { id: 'load', label: 'Teams', description: 'Start every team at zero points.' },
  { id: 'award', label: 'Matches', description: 'Each match gives points to both sides.' },
  { id: 'aggregate', label: 'Totals', description: 'Points are summed per team.' },
  { id: 'order', label: 'Order', description: 'Sort by points, then by team id.' },
  { id: 'done', label: 'Result', description: 'Report the standings.' },
]

const SQL_SOURCE = `WITH points AS (
  SELECT host_team AS team_id, CASE WHEN host_goals > guest_goals THEN 3 WHEN host_goals = guest_goals THEN 1 ELSE 0 END AS pts FROM Matches
  UNION ALL
  SELECT guest_team, CASE WHEN guest_goals > host_goals THEN 3 WHEN guest_goals = host_goals THEN 1 ELSE 0 END FROM Matches
)
SELECT t.team_id, t.team_name, COALESCE(SUM(p.pts), 0) AS num_points
FROM Teams t
LEFT JOIN points p ON p.team_id = t.team_id
GROUP BY t.team_id, t.team_name
ORDER BY num_points DESC, t.team_id ASC;`

const PY_SOURCE = `import pandas as pd

def points_for(diff):
    return 3 if diff > 0 else 1 if diff == 0 else 0

def team_scores(teams, matches):
    host = pd.DataFrame({"team_id": matches.host_team, "pts": [points_for(h - g) for h, g in zip(matches.host_goals, matches.guest_goals)]})
    guest = pd.DataFrame({"team_id": matches.guest_team, "pts": [points_for(g - h) for h, g in zip(matches.host_goals, matches.guest_goals)]})
    points = pd.concat([host, guest]).groupby("team_id", as_index=False)["pts"].sum()
    out = teams.merge(points, on="team_id", how="left")
    out["num_points"] = out["pts"].fillna(0).astype(int)
    out = out[["team_id", "team_name", "num_points"]]
    return out.sort_values(["num_points", "team_id"], ascending=[False, True]).reset_index(drop=True)`

const SQL_LINES = SQL_SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const PY_LINES = PY_SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
export const code = SQL_LINES
export const sql = SQL_SOURCE
export const python = PY_SOURCE

const COLUMNS = ['team_id', 'team_name', 'num_points']
const at = (lines, fragment) => {
  const hit = lines.find(line => line.text.includes(fragment))
  if (!hit) throw new Error(`No line contains "${fragment}"`)
  return hit.line
}
const copy = rows => JSON.parse(JSON.stringify(rows))
const intIn = (value, low, high) => Number.isInteger(value) && value >= low && value <= high

export function parseInput(text) {
  const input = JSON.parse(text)
  const { teams, matches } = input ?? {}
  if (!Array.isArray(teams) || teams.length < 1 || teams.length > 8) throw new Error('teams has 1 to 8 rows.')
  if (!Array.isArray(matches) || matches.length > 12) throw new Error('matches has at most 12 rows.')
  const ids = new Set()
  for (const team of teams) {
    if (!intIn(team?.team_id, 1, 999) || typeof team.team_name !== 'string' || !team.team_name) throw new Error('Each team needs an integer team_id and a team_name.')
    if (ids.has(team.team_id)) throw new Error('team_id must be unique.')
    ids.add(team.team_id)
  }
  for (const match of matches) {
    if (!intIn(match?.match_id, 1, 999)) throw new Error('Each match needs an integer match_id.')
    if (!ids.has(match.host_team) || !ids.has(match.guest_team) || match.host_team === match.guest_team) throw new Error('Each match needs two different known teams.')
    if (!intIn(match.host_goals, 0, 20) || !intIn(match.guest_goals, 0, 20)) throw new Error('Goals are integers from 0 to 20.')
  }
  return {
    teams: teams.map(team => ({ team_id: team.team_id, team_name: team.team_name })),
    matches: matches.map(match => ({ match_id: match.match_id, host_team: match.host_team, guest_team: match.guest_team, host_goals: match.host_goals, guest_goals: match.guest_goals })),
  }
}

const pointsFor = diff => (diff > 0 ? 3 : diff === 0 ? 1 : 0)

export function buildTrace(input) {
  const { teams, matches } = input
  const rows = teams.map(team => ({ team_id: team.team_id, team_name: team.team_name, num_points: 0 }))
  const byId = new Map(rows.map(row => [row.team_id, row]))
  const frames = []
  const push = (phase, sqlFragment, pyFragment, message) => frames.push({
    phase, activeLine: at(SQL_LINES, sqlFragment), pythonLine: at(PY_LINES, pyFragment),
    message, columns: COLUMNS, rows: copy(rows),
  })
  push('load', 'FROM Teams t', 'def team_scores', `Start ${rows.length} teams at zero points.`)
  for (const match of matches) {
    const hostPts = pointsFor(match.host_goals - match.guest_goals)
    const guestPts = pointsFor(match.guest_goals - match.host_goals)
    byId.get(match.host_team).num_points += hostPts
    byId.get(match.guest_team).num_points += guestPts
    push('award', 'SELECT host_team', 'host = pd.DataFrame', `Match ${match.match_id}: team ${match.host_team} gets ${hostPts}, team ${match.guest_team} gets ${guestPts}.`)
  }
  push('aggregate', 'GROUP BY t.team_id', 'groupby', 'Each team keeps its summed points; teams without matches stay at zero.')
  rows.sort((a, b) => b.num_points - a.num_points || a.team_id - b.team_id)
  push('order', 'ORDER BY num_points', 'sort_values', 'Rank by points, highest first; equal points fall back to the smaller team id.')
  push('done', 'SELECT t.team_id', 'return out', 'Report the standings.')
  return { input, result: copy(rows), columns: COLUMNS, frames }
}
