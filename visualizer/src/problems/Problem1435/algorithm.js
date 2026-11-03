// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `SELECT b.label AS bin, COUNT(s.session_id) AS total
FROM bins AS b
LEFT JOIN Sessions AS s
  ON s.duration >= b.low_sec AND s.duration < b.high_sec
GROUP BY b.label
ORDER BY b.position`

const PANDAS = `import pandas as pd

def session_bars(sessions):
    edges = [0, 300, 600, 900, float("inf")]
    labels = ["[0-5)", "[5-10)", "[10-15)", "15+"]
    bins = pd.cut(sessions["duration"], bins=edges, labels=labels, right=False)
    counts = bins.value_counts().reindex(labels, fill_value=0)
    return counts.rename_axis("bin").reset_index(name="total")`

const SQL_LINES = SQL.split('\n')
const PY_LINES = PANDAS.split('\n')

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing line: ${text}`)
  return index + 1
}

export const sql = SQL
export const python = PANDAS
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))

const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase,
  activeLine: lineOf(SQL_LINES, sqlText),
  pythonLine: lineOf(PY_LINES, pyText),
  message,
  columns: [...columns],
  rows: rows.map(row => ({ ...row })),
})

// Half-open bins in seconds: [0, 300), [300, 600), [600, 900), [900, infinity).
const BINS = [
  { label: '[0-5)', low: 0, high: 300 },
  { label: '[5-10)', low: 300, high: 600 },
  { label: '[10-15)', low: 600, high: 900 },
  { label: '15+', low: 900, high: Infinity },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Sessions) || input.Sessions.length > 12) throw new Error('Use a Sessions list of at most 12 rows.')
  const Sessions = input.Sessions.map(row => {
    if (!row || !Number.isInteger(row.session_id) || !Number.isInteger(row.duration) || row.duration < 0) {
      throw new Error('Each session needs an integer session_id and a non-negative integer duration in seconds.')
    }
    return { session_id: row.session_id, duration: row.duration }
  })
  return { Sessions }
}

export function buildTrace({ Sessions }) {
  const columns = ['session_id', 'duration', 'bin']
  const frames = [frame('load', 'FROM bins', 'def session_bars', `Read ${Sessions.length} sessions and the four bins.`, ['session_id', 'duration'], Sessions)]
  const placed = []
  for (const session of Sessions) {
    const bin = BINS.find(candidate => session.duration >= candidate.low && session.duration < candidate.high)
    placed.push({ session_id: session.session_id, duration: session.duration, bin: bin.label })
    frames.push(frame('match', 'ON s.duration', 'pd.cut', `Duration ${session.duration} seconds falls in ${bin.label}.`, columns, placed))
  }
  const result = BINS.map(bin => ({ bin: bin.label, total: placed.filter(row => row.bin === bin.label).length }))
  result.forEach((row, index) => {
    frames.push(frame('output', 'GROUP BY', 'reindex', `${row.bin} holds ${row.total} sessions, including when it is empty.`, ['bin', 'total'], result.slice(0, index + 1)))
  })
  frames.push(frame('done', 'ORDER BY', 'return counts', 'Bins appear in their fixed order.', ['bin', 'total'], result))
  return { input: { Sessions }, result, frames }
}
