const SQL = `WITH ordered AS (
  SELECT player_id, match_day, result,
    ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY match_day) AS seq
  FROM Matches
),
wins AS (
  SELECT player_id, seq,
    seq - ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY match_day) AS island
  FROM ordered
  WHERE result = 'Win'
),
streaks AS (
  SELECT player_id, COUNT(*) AS len
  FROM wins
  GROUP BY player_id, island
),
best AS (
  SELECT player_id, MAX(len) AS longest_streak
  FROM streaks
  GROUP BY player_id
)
SELECT p.player_id, COALESCE(b.longest_streak, 0) AS longest_streak
FROM (SELECT DISTINCT player_id FROM Matches) p
LEFT JOIN best b ON b.player_id = p.player_id
ORDER BY p.player_id;`

const PY = `import pandas as pd

def longest_winning_streak(matches):
    matches = matches.sort_values(["player_id", "match_day"])
    matches["seq"] = matches.groupby("player_id").cumcount() + 1
    wins = matches[matches["result"] == "Win"].copy()
    wins["win_seq"] = wins.groupby("player_id").cumcount() + 1
    wins["island"] = wins["seq"] - wins["win_seq"]
    runs = wins.groupby(["player_id", "island"]).size()
    best = runs.groupby("player_id").max()
    players = matches["player_id"].drop_duplicates().sort_values()
    out = pd.DataFrame({"player_id": players.values})
    out["longest_streak"] = out["player_id"].map(best).fillna(0).astype(int)
    return out
`

const SQL_LINES = SQL.split('\n')
const PY_LINES = PY.split('\n')
const snap = rows => JSON.parse(JSON.stringify(rows))
function lineOf(lines, fragment, label) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`${label} has no line containing "${fragment}"`)
  return index + 1
}
const frame = (phase, sqlFragment, pyFragment, message, rows) => ({
  phase,
  activeLine: lineOf(SQL_LINES, sqlFragment, 'SQL'),
  pythonLine: lineOf(PY_LINES, pyFragment, 'Python'),
  message,
  rows: snap(rows),
})

export const sql = SQL
export const python = PY
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const phases = [
  { id: 'sort', label: 'Order', description: 'Order each player’s matches by day.' },
  { id: 'walk', label: 'Walk', description: 'Read each match: a win extends the streak, anything else resets it.' },
  { id: 'record', label: 'Best', description: 'Keep the longest streak for this player.' },
  { id: 'done', label: 'Result', description: 'Every player with a longest streak, by id.' },
]
export const sample = {
  matches: [
    { player_id: 1, match_day: 1, result: 'Win' },
    { player_id: 1, match_day: 2, result: 'Win' },
    { player_id: 1, match_day: 4, result: 'Lose' },
    { player_id: 1, match_day: 5, result: 'Win' },
    { player_id: 1, match_day: 6, result: 'Win' },
    { player_id: 1, match_day: 7, result: 'Win' },
    { player_id: 2, match_day: 3, result: 'Draw' },
    { player_id: 2, match_day: 8, result: 'Win' },
    { player_id: 3, match_day: 2, result: 'Lose' },
  ],
}

const RESULTS = new Set(['Win', 'Draw', 'Lose'])

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.matches) || input.matches.length > 20) throw new Error('Provide at most 20 matches.')
  const seen = new Set()
  for (const m of input.matches) {
    if (!Number.isInteger(m.player_id) || !Number.isInteger(m.match_day)) throw new Error('player_id and match_day are integers.')
    if (!RESULTS.has(m.result)) throw new Error('result is Win, Draw or Lose.')
    const key = `${m.player_id}:${m.match_day}`
    if (seen.has(key)) throw new Error('A player plays at most one match per day.')
    seen.add(key)
  }
  return input
}

export function buildTrace(input) {
  const rows = [...input.matches].sort((a, b) => a.player_id - b.player_id || a.match_day - b.match_day)
  const players = [...new Set(rows.map(r => r.player_id))].sort((a, b) => a - b)
  const frames = []
  const log = []
  const result = []
  frames.push(frame('sort', 'ROW_NUMBER() OVER (PARTITION BY player_id', 'matches = matches.sort_values', `Order ${rows.length} matches by player, then day.`, rows))
  for (const pid of players) {
    let streak = 0
    let best = 0
    for (const m of rows.filter(r => r.player_id === pid)) {
      streak = m.result === 'Win' ? streak + 1 : 0
      best = Math.max(best, streak)
      log.push({ player_id: pid, match_day: m.match_day, result: m.result, streak, longest: best })
      frames.push(frame('walk', "WHERE result = 'Win'", 'wins = matches[', `Player ${pid}, day ${m.match_day}: ${m.result}, streak now ${streak}.`, log))
    }
    result.push({ player_id: pid, longest_streak: best })
    frames.push(frame('record', 'MAX(len)', 'best = runs.groupby', `Player ${pid} has a longest streak of ${best}.`, result))
  }
  frames.push(frame('done', 'ORDER BY p.player_id', 'return out', 'Players listed by id.', result))
  return { input, result, frames }
}
