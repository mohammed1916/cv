// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT a.team_name AS home_team, b.team_name AS away_team
FROM Teams a
CROSS JOIN Teams b
WHERE a.team_name <> b.team_name
ORDER BY home_team, away_team`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def all_matches(teams):
    pairs = teams.merge(teams, how="cross")
    pairs = pairs[pairs["team_name_x"] != pairs["team_name_y"]]
    pairs = pairs.rename(columns={"team_name_x": "home_team", "team_name_y": "away_team"})
    return pairs.sort_values(["home_team", "away_team"]).to_dict("records")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the team names.' },
  { id: 'cross', label: 'Cross', description: 'Form every ordered pair, including self pairs.' },
  { id: 'filter', label: 'Filter', description: 'Remove pairs where a team meets itself.' },
  { id: 'order', label: 'Order', description: 'Sort the pairs by home team, then away team.' },
  { id: 'done', label: 'Result', description: 'Report all matches.' },
]

export const inputLabel = 'Object with a Teams table'
export const complexity = 'O(n²) pairs for n teams, plus O(n² log n) to sort them. The visualizer caps the table at 12 teams.'
export const examples = [{
  label: 'Sample',
  input: '{"Teams":[{"team_name":"Eagles"},{"team_name":"Lions"},{"team_name":"Tigers"}]}',
}]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Teams table.')
  const Teams = tableRows(input, 'Teams', ['team_name'])
  if (new Set(Teams.map(row => row.team_name)).size !== Teams.length) throw new Error('Team names must be unique.')
  return { Teams }
}

const byPair = (a, b) => (a.home_team < b.home_team ? -1 : a.home_team > b.home_team ? 1 : a.away_team < b.away_team ? -1 : a.away_team > b.away_team ? 1 : 0)

export function buildTrace(input) {
  const { Teams } = input
  const cols = ['home_team', 'away_team']
  const frames = [frame('load', 'FROM Teams', 'def ', `Load ${Teams.length} teams.`, ['team_name'], Teams)]
  const crossed = []
  for (const home of Teams) for (const away of Teams) crossed.push({ home_team: home.team_name, away_team: away.team_name })
  frames.push(frame('cross', 'CROSS JOIN', 'merge(', `Form all ${crossed.length} ordered pairs.`, cols, crossed))
  const kept = crossed.filter(pair => pair.home_team !== pair.away_team)
  frames.push(frame('filter', 'WHERE', 'pairs = pairs[', `Drop the ${crossed.length - kept.length} self pairs.`, cols, kept))
  const result = [...kept].sort(byPair)
  frames.push(frame('order', 'ORDER BY', 'return', 'Sort the matches by home team, then away team.', cols, result))
  frames.push(frame('done', 'SELECT', 'return', `Return ${result.length} matches.`, cols, result))
  return { input, result, frames }
}
