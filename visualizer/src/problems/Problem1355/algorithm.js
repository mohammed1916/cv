// Knowledge-derived teaching model: the tables, SQL and pandas steps are written for this site.
// Rule used here: only activities with at least one participant form the population.
const SQL = `WITH counts AS (
  SELECT a.name AS activity, COUNT(f.id) AS participants
  FROM Activities a JOIN Friends f ON f.activity = a.id
  GROUP BY a.id, a.name
)
SELECT activity FROM counts
WHERE participants > (SELECT MIN(participants) FROM counts)
  AND participants < (SELECT MAX(participants) FROM counts)
ORDER BY activity;`

const PY_SRC = `import pandas as pd

def activity_participants(activities, friends):
    names = activities.set_index("id")["name"]
    counts = friends.groupby("activity").size().rename(index=names).reset_index(name="participants")
    low, high = counts["participants"].min(), counts["participants"].max()
    kept = counts[(counts["participants"] > low) & (counts["participants"] < high)]
    return kept[["activity"]].sort_values("activity")`

const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const lineOf = (list, text) => {
  const hit = list.find(l => l.text.includes(text))
  if (!hit) throw new Error(`Missing line: ${text}`)
  return hit.line
}

export const code = lines(SQL)
export const python = PY_SRC
const PY = lines(PY_SRC)
const sqlLine = text => lineOf(code, text)
const pyLine = text => lineOf(PY, text)

export const phases = [
  { id: 'load', label: 'Join', description: 'Join friends to their activity names.' },
  { id: 'count', label: 'Count', description: 'Count participants for each activity.' },
  { id: 'range', label: 'Range', description: 'Find the smallest and largest counts.' },
  { id: 'filter', label: 'Filter', description: 'Keep counts strictly between the extremes.' },
  { id: 'output', label: 'Result', description: 'Report the kept activities by name.' },
]

const frame = (phase, sql, py, message, rows) => ({
  phase,
  activeLine: sqlLine(sql),
  pythonLine: pyLine(py),
  message,
  rows: rows.map(row => ({ ...row })),
})

const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with activities and friends.')
  const { activities, friends } = input
  if (!Array.isArray(activities) || !Array.isArray(friends)) throw new Error('activities and friends are lists.')
  if (activities.length > 10 || friends.length > 30) throw new Error('Keep the sample small: at most 10 activities and 30 friends.')
  for (const a of activities) {
    if (!Number.isInteger(a.id) || typeof a.name !== 'string') throw new Error('Each activity has an integer id and a name.')
  }
  for (const f of friends) {
    if (!Number.isInteger(f.id) || typeof f.name !== 'string' || !Number.isInteger(f.activity)) {
      throw new Error('Each friend has an integer id, a name and an integer activity id.')
    }
  }
  return { activities, friends }
}

export function buildTrace(input) {
  const { activities, friends } = input
  const frames = []
  frames.push(frame('load', 'FROM Activities a JOIN Friends', 'names = activities.set_index', `Join ${friends.length} friends to activity names.`, friends))

  const counted = []
  for (const a of activities) {
    const n = friends.filter(f => f.activity === a.id).length
    if (n === 0) continue
    counted.push({ activity: a.name, participants: n, verdict: 'pending' })
    frames.push(frame('count', 'GROUP BY a.id', 'counts = friends.groupby', `${a.name} has ${n} participant${n === 1 ? '' : 's'}.`, counted))
  }

  const low = Math.min(...counted.map(c => c.participants))
  const high = Math.max(...counted.map(c => c.participants))
  frames.push(frame('range', 'WITH counts AS', 'low, high = ', `Lowest count ${low}, highest count ${high}. Any tie with these is excluded.`, counted))

  const kept = []
  counted.forEach((c, i) => {
    const keep = c.participants > low && c.participants < high
    counted[i] = { ...c, verdict: keep ? 'kept' : 'excluded' }
    if (keep) kept.push({ activity: c.activity })
    frames.push(frame('filter', 'WHERE participants >', 'kept = counts[', `${c.activity}: ${c.participants} is ${keep ? 'strictly between' : 'an extreme or tied extreme'}.`, counted))
  })

  const result = kept.sort((a, b) => byText(a.activity, b.activity))
  frames.push(frame('output', 'ORDER BY activity', 'return kept[["activity"]]', `${result.length} activit${result.length === 1 ? 'y' : 'ies'} kept.`, result))
  return { input, result, frames }
}
