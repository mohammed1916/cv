const SQL = `WITH points AS (
  SELECT first_player AS player_id, first_score AS pts FROM Matches
  UNION ALL
  SELECT second_player, second_score FROM Matches
),
totals AS (
  SELECT p.player_id, p.group_id, COALESCE(SUM(x.pts), 0) AS total
  FROM Players p LEFT JOIN points x ON x.player_id = p.player_id
  GROUP BY p.player_id, p.group_id
),
ranked AS (
  SELECT group_id, player_id,
    ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY total DESC, player_id) AS rnk
  FROM totals
)
SELECT group_id, player_id FROM ranked WHERE rnk = 1 ORDER BY group_id;`

const PY = `import pandas as pd

def tournament_winners(players, matches):
    first = matches[["first_player", "first_score"]].set_axis(["player_id", "pts"], axis=1)
    second = matches[["second_player", "second_score"]].set_axis(["player_id", "pts"], axis=1)
    points = pd.concat([first, second]).groupby("player_id", as_index=False)["pts"].sum()
    totals = players.merge(points, on="player_id", how="left").fillna({"pts": 0})
    ranked = totals.sort_values(["group_id", "pts", "player_id"], ascending=[True, False, True])
    winners = ranked.drop_duplicates("group_id", keep="first")
    return winners[["group_id", "player_id"]].sort_values("group_id")
`

const snap = rows => JSON.parse(JSON.stringify(rows))
const SQL_LINES = SQL.split('\n')
const PY_LINES = PY.split('\n')
function lookup(lines, fragment, label) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`${label} has no line containing "${fragment}"`)
  return index + 1
}
const sqlLine = fragment => lookup(SQL_LINES, fragment, 'SQL')
const pyLine = fragment => lookup(PY_LINES, fragment, 'Python')
const frame = (phase, sqlFragment, pyFragment, message, rows) => ({
  phase, activeLine: sqlLine(sqlFragment), pythonLine: pyLine(pyFragment), message, rows: snap(rows),
})

export const sql = SQL
export const python = PY
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const phases = [
  { id: 'load', label: 'Players', description: 'Every player starts with zero points.' },
  { id: 'score', label: 'Score', description: 'Each match adds its scores to both players.' },
  { id: 'rank', label: 'Rank', description: 'Order by group, then points, then id.' },
  { id: 'pick', label: 'Winner', description: 'Keep the first player of each group.' },
  { id: 'done', label: 'Result', description: 'Winners listed by group.' },
]
export const sample = {
  players: [
    { player_id: 10, group_id: 1 }, { player_id: 20, group_id: 1 }, { player_id: 30, group_id: 2 },
    { player_id: 40, group_id: 2 }, { player_id: 50, group_id: 3 },
  ],
  matches: [
    { match_id: 1, first_player: 10, second_player: 20, first_score: 5, second_score: 5 },
    { match_id: 2, first_player: 30, second_player: 40, first_score: 7, second_score: 9 },
    { match_id: 3, first_player: 20, second_player: 10, first_score: 3, second_score: 7 },
  ],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  const { players, matches } = input
  if (!Array.isArray(players) || !Array.isArray(matches)) throw new Error('Provide players and matches arrays.')
  const ids = new Set(players.map(p => p.player_id))
  if (ids.size !== players.length) throw new Error('player_id must be unique.')
  for (const m of matches) {
    if (!ids.has(m.first_player) || !ids.has(m.second_player)) throw new Error(`Match ${m.match_id} names an unknown player.`)
  }
  return input
}

export function buildTrace(input) {
  const { players, matches } = input
  const totals = new Map()
  const view = () => [...totals.values()]
  const frames = []
  for (const p of players) totals.set(p.player_id, { player_id: p.player_id, group_id: p.group_id, points: 0 })
  frames.push(frame('load', 'FROM Players', 'totals = players.merge', 'Every player starts at zero points.', view()))
  for (const m of matches) {
    totals.get(m.first_player).points += m.first_score
    totals.get(m.second_player).points += m.second_score
    frames.push(frame('score', 'SELECT first_player AS', 'points = pd.concat', `Match ${m.match_id} adds ${m.first_score} and ${m.second_score} points.`, view()))
  }
  const ranked = view().sort((a, b) => b.points - a.points || a.player_id - b.player_id)
  frames.push(frame('rank', 'ROW_NUMBER', 'ranked = totals.sort_values', 'Order players: most points first, smaller id on ties.', ranked))
  const seen = new Set()
  const picked = []
  for (const row of ranked) {
    if (seen.has(row.group_id)) continue
    seen.add(row.group_id)
    picked.push({ group_id: row.group_id, player_id: row.player_id })
  }
  const result = picked.sort((a, b) => a.group_id - b.group_id)
  frames.push(frame('pick', 'WHERE rnk = 1', 'winners = ranked', `Keep the first player of each group: ${result.length} winners.`, result))
  frames.push(frame('done', 'ORDER BY group_id', 'return winners', 'Winners listed by group.', result))
  return { input, result, frames }
}
