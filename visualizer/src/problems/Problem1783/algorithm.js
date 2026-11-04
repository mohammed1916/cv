// Teaching version of the query. The sample rows are invented for this visualization.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the players and the yearly championship results.' },
  { id: 'tally', label: 'Tally', description: 'Stack the four tournament columns and count wins per player.' },
  { id: 'done', label: 'Result', description: 'Return players with at least one win.' },
]

export const sql = `SELECT p.player_id, p.player_name, COUNT(*) AS grand_slams_count
FROM Players p
JOIN (
  SELECT Wimbledon AS player_id FROM Championships
  UNION ALL SELECT Fr_open FROM Championships
  UNION ALL SELECT US_open FROM Championships
  UNION ALL SELECT Au_open FROM Championships
) w ON w.player_id = p.player_id
GROUP BY p.player_id, p.player_name
ORDER BY p.player_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def grand_slam_counts(players, championships):
    wins = pd.concat([championships[col].rename("player_id") for col in ["Wimbledon", "Fr_open", "US_open", "Au_open"]])
    counts = wins.value_counts().rename_axis("player_id").reset_index(name="grand_slams_count")
    result = players.merge(counts, on="player_id")
    return result.sort_values("player_id")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const PLAYER_COLUMNS = ['player_id', 'player_name']
const CHAMP_COLUMNS = ['year', 'Wimbledon', 'Fr_open', 'US_open', 'Au_open']
const TALLY_COLUMNS = ['player_id', 'player_name', 'grand_slams_count']
const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

const TOURNAMENTS = ['Wimbledon', 'Fr_open', 'US_open', 'Au_open']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Players and Championships.')
  const { Players, Championships } = input
  if (!Array.isArray(Players) || Players.length < 1 || Players.length > 12) throw new Error('Players needs 1 to 12 rows.')
  if (!Array.isArray(Championships) || Championships.length < 1 || Championships.length > 12) throw new Error('Championships needs 1 to 12 rows.')
  const players = Players.map(row => {
    if (!row || !Number.isInteger(row.player_id) || typeof row.player_name !== 'string') throw new Error('Players rows need an integer player_id and a player_name.')
    return { player_id: row.player_id, player_name: row.player_name }
  })
  const championships = Championships.map(row => {
    if (!row || !Number.isInteger(row.year) || TOURNAMENTS.some(column => !Number.isInteger(row[column]))) throw new Error('Championships rows need year and four integer winner ids.')
    return Object.fromEntries(CHAMP_COLUMNS.map(column => [column, row[column]]))
  })
  return { Players: players, Championships: championships }
}

export function buildTrace(input) {
  const { Players, Championships } = input
  const names = new Map(Players.map(row => [row.player_id, row.player_name]))
  const frames = [
    frame('load', 'FROM Players', 'def ', 'Load the players.', PLAYER_COLUMNS, Players),
    frame('load', 'FROM Championships', 'wins = ', 'Load the yearly results.', CHAMP_COLUMNS, Championships),
  ]
  const counts = new Map()
  for (const year of Championships) {
    for (const column of TOURNAMENTS) {
      const id = year[column]
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
    const tally = [...counts.entries()]
      .filter(([id]) => names.has(id))
      .sort((a, b) => a[0] - b[0])
      .map(([id, count]) => ({ player_id: id, player_name: names.get(id), grand_slams_count: count }))
    const winners = TOURNAMENTS.map(column => `${column} ${year[column]}`).join(', ')
    frames.push(frame('tally', 'UNION ALL SELECT Fr_open', 'counts = ', `Year ${year.year} adds wins: ${winners}.`, TALLY_COLUMNS, tally))
  }
  const result = [...counts.entries()]
    .filter(([id]) => names.has(id))
    .sort((a, b) => a[0] - b[0])
    .map(([id, count]) => ({ player_id: id, player_name: names.get(id), grand_slams_count: count }))
  frames.push(frame('done', 'ORDER BY p.player_id', 'return', `Return ${result.length} player${result.length === 1 ? '' : 's'} with at least one win.`, TALLY_COLUMNS, result))
  return { input, result, frames }
}
