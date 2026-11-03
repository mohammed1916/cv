// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH sides AS (
  SELECT home_team_id AS team_id, home_team_goals AS scored, away_team_goals AS conceded,
         CASE WHEN home_team_goals > away_team_goals THEN 3
              WHEN home_team_goals = away_team_goals THEN 1 ELSE 0 END AS pts
  FROM Matches
  UNION ALL
  SELECT away_team_id, away_team_goals, home_team_goals,
         CASE WHEN away_team_goals > home_team_goals THEN 3
              WHEN away_team_goals = home_team_goals THEN 1 ELSE 0 END
  FROM Matches
),
totals AS (
  SELECT team_id,
         COUNT(*) AS matches_played,
         SUM(pts) AS points,
         SUM(scored) AS goals_for,
         SUM(conceded) AS goals_against
  FROM sides
  GROUP BY team_id
)
SELECT t.team_name,
       COALESCE(s.matches_played, 0) AS matches_played,
       COALESCE(s.points, 0) AS points,
       COALESCE(s.goals_for, 0) AS goals_for,
       COALESCE(s.goals_against, 0) AS goals_against,
       COALESCE(s.goals_for, 0) - COALESCE(s.goals_against, 0) AS goal_diff
FROM Teams t
LEFT JOIN totals s ON s.team_id = t.team_id
ORDER BY points DESC, goal_diff DESC, t.team_name`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def league_statistics(teams, matches):
    home = matches.rename(columns={"home_team_id": "team_id", "home_team_goals": "scored", "away_team_goals": "conceded"})
    away = matches.rename(columns={"away_team_id": "team_id", "away_team_goals": "scored", "home_team_goals": "conceded"})
    sides = pd.concat([home, away])
    sides["pts"] = np.select([sides["scored"] > sides["conceded"], sides["scored"] == sides["conceded"]], [3, 1], 0)
    totals = sides.groupby("team_id").agg(matches_played=("pts", "size"), points=("pts", "sum"),
                                          goals_for=("scored", "sum"), goals_against=("conceded", "sum"))
    out = teams.merge(totals, on="team_id", how="left").fillna(0)
    out["goal_diff"] = out["goals_for"] - out["goals_against"]
    return out.sort_values(["points", "goal_diff", "team_name"], ascending=[False, False, True])`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const TEAM_COLUMNS = ['team_id', 'team_name']
const MATCH_COLUMNS = ['home_team_id', 'away_team_id', 'home_team_goals', 'away_team_goals']
const STAT_COLUMNS = ['team_name', 'matches_played', 'points', 'goals_for', 'goals_against', 'goal_diff']

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the teams and the match results.' },
  { id: 'sides', label: 'Sides', description: 'Give each match a row for the home team and a row for the away team.' },
  { id: 'totals', label: 'Totals', description: 'Add up matches, points and goals for each team.' },
  { id: 'done', label: 'Result', description: 'Rank the teams by points, then goal difference, then name.' },
]

export const inputLabel = 'Object with Teams and Matches tables'
export const complexity = 'O(T + M log T) for T teams and M matches, from one pass over the sides and a sort of the teams. The visualizer caps each table at 12 rows.'

function tableRows(input, name, columns, min = 1) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < min || rows.length > 12) throw new Error(`${name} needs ${min} to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Teams and Matches tables.')
  const Teams = tableRows(input, 'Teams', TEAM_COLUMNS)
  const Matches = tableRows(input, 'Matches', MATCH_COLUMNS, 0)
  const known = new Set(Teams.map(team => team.team_id))
  for (const match of Matches) {
    if (!known.has(match.home_team_id) || !known.has(match.away_team_id)) throw new Error('Every match must name two known teams.')
  }
  return { Teams, Matches }
}

export function buildTrace(input) {
  const teams = [...input.Teams].sort((a, b) => a.team_id - b.team_id)
  const matches = input.Matches
  const frames = []
  frames.push(frame('load', 'FROM Matches', 'def ', `Load ${teams.length} teams and ${matches.length} matches.`, TEAM_COLUMNS, teams))

  const stats = new Map(teams.map(team => [team.team_id, { team_name: team.team_name, matches_played: 0, points: 0, goals_for: 0, goals_against: 0 }]))
  const sideRows = []
  const add = (teamId, scored, conceded) => {
    const pts = scored > conceded ? 3 : scored === conceded ? 1 : 0
    const row = stats.get(teamId)
    row.matches_played += 1
    row.points += pts
    row.goals_for += scored
    row.goals_against += conceded
    sideRows.push({ team_id: teamId, scored, conceded, pts })
  }
  for (const match of matches) {
    add(match.home_team_id, match.home_team_goals, match.away_team_goals)
    add(match.away_team_id, match.away_team_goals, match.home_team_goals)
    frames.push(frame('sides', 'UNION ALL', 'sides =', `Add both sides of match ${match.home_team_id} v ${match.away_team_id}.`,
      ['team_id', 'scored', 'conceded', 'pts'], sideRows))
  }

  const snapshot = () => teams.map(team => {
    const row = stats.get(team.team_id)
    return { ...row, goal_diff: row.goals_for - row.goals_against }
  })
  frames.push(frame('totals', 'GROUP BY team_id', 'totals =', 'Totals per team, with zero for teams that played no match.', STAT_COLUMNS, snapshot()))

  const ranked = snapshot()
    .map(row => ({ team_name: row.team_name, matches_played: row.matches_played, points: row.points, goals_for: row.goals_for, goals_against: row.goals_against, goal_diff: row.goal_diff }))
    .sort((a, b) => b.points - a.points || b.goal_diff - a.goal_diff || (a.team_name < b.team_name ? -1 : a.team_name > b.team_name ? 1 : 0))
  frames.push(frame('done', 'ORDER BY points DESC', 'return out', `Return ${ranked.length} ranked teams.`, STAT_COLUMNS, ranked))
  return { input, result: ranked, frames }
}
