const SQL = `WITH daily AS (
  SELECT gender, day, SUM(score_points) AS points
  FROM Scores
  GROUP BY gender, day
)
SELECT gender, day,
  SUM(points) OVER (PARTITION BY gender ORDER BY day) AS total
FROM daily
ORDER BY gender, day;`

const PY = `import pandas as pd

def running_totals(scores):
    daily = scores.groupby(["gender", "day"], as_index=False)["score_points"].sum()
    daily = daily.sort_values(["gender", "day"])
    daily["total"] = daily.groupby("gender")["score_points"].cumsum()
    return daily[["gender", "day", "total"]]
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
  { id: 'daily', label: 'Daily', description: 'Add the score rows of each gender and day.' },
  { id: 'running', label: 'Running', description: 'Carry each gender’s total forward in date order.' },
  { id: 'done', label: 'Result', description: 'Totals sorted by gender then day.' },
]
export const sample = {
  scores: [
    { player_name: 'Ann', gender: 'female', day: '2019-01-01', score_points: 10 },
    { player_name: 'Bo', gender: 'male', day: '2019-01-01', score_points: 4 },
    { player_name: 'Cy', gender: 'female', day: '2019-01-03', score_points: 6 },
    { player_name: 'Di', gender: 'male', day: '2019-01-02', score_points: 7 },
    { player_name: 'Ed', gender: 'male', day: '2019-01-03', score_points: 1 },
    { player_name: 'Fi', gender: 'female', day: '2019-01-04', score_points: 2 },
  ],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.scores)) throw new Error('Provide a scores array.')
  for (const s of input.scores) {
    if (typeof s.score_points !== 'number') throw new Error('score_points must be a number.')
  }
  return input
}

export function buildTrace(input) {
  const daily = new Map()
  const frames = []
  const dailyRows = () => [...daily.values()].map(d => ({ gender: d.gender, day: d.day, points: d.points }))
  for (const s of input.scores) {
    const key = `${s.gender}|${s.day}`
    if (!daily.has(key)) daily.set(key, { gender: s.gender, day: s.day, points: 0 })
    daily.get(key).points += s.score_points
    frames.push(frame('daily', 'GROUP BY gender, day', 'daily = scores.groupby', `${s.player_name} adds ${s.score_points} to ${s.gender} on ${s.day}.`, dailyRows()))
  }
  const ordered = dailyRows().sort((a, b) => (a.gender < b.gender ? -1 : a.gender > b.gender ? 1 : 0) || (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))
  const running = new Map()
  const result = []
  for (const d of ordered) {
    const total = (running.get(d.gender) || 0) + d.points
    running.set(d.gender, total)
    result.push({ gender: d.gender, day: d.day, total })
    frames.push(frame('running', 'SUM(points) OVER', 'daily["total"]', `${d.gender} on ${d.day}: running total ${total}.`, result))
  }
  frames.push(frame('done', 'ORDER BY gender, day', 'return daily', 'Totals sorted by gender then day.', result))
  return { input, result, frames }
}
