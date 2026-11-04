// Teaching version of the query. The sample tables are invented for this visualization.
const SQL = `SELECT person1, person2, COUNT(*) AS call_count, SUM(duration) AS total_duration
FROM (
  SELECT CASE WHEN from_id < to_id THEN from_id ELSE to_id END AS person1,
         CASE WHEN from_id < to_id THEN to_id ELSE from_id END AS person2,
         duration
  FROM Calls
) AS pairs
GROUP BY person1, person2
ORDER BY person1, person2`

const PANDAS = `import pandas as pd

def pair_call_totals(calls):
    low = calls[["from_id", "to_id"]].min(axis=1)
    high = calls[["from_id", "to_id"]].max(axis=1)
    pairs = pd.DataFrame({"person1": low, "person2": high, "duration": calls["duration"]})
    return (pairs.groupby(["person1", "person2"], as_index=False)
                 .agg(call_count=("duration", "size"), total_duration=("duration", "sum"))
                 .sort_values(["person1", "person2"]))`

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

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Calls) || input.Calls.length > 12) throw new Error('Use a Calls list of at most 12 rows.')
  const Calls = input.Calls.map(row => {
    if (!row || !Number.isInteger(row.from_id) || !Number.isInteger(row.to_id) || !Number.isInteger(row.duration) || row.duration < 0) {
      throw new Error('Each call needs integer from_id and to_id and a non-negative integer duration.')
    }
    return { from_id: row.from_id, to_id: row.to_id, duration: row.duration }
  })
  return { Calls }
}

export function buildTrace({ Calls }) {
  const callColumns = ['from_id', 'to_id', 'duration']
  const pairColumns = ['person1', 'person2', 'call_count', 'total_duration']
  const frames = [frame('load', 'FROM Calls', 'def pair_call_totals', `Read ${Calls.length} calls.`, callColumns, Calls)]
  const totals = new Map()
  const sortPairs = (a, b) => a.person1 - b.person1 || a.person2 - b.person2
  for (const call of Calls) {
    const person1 = Math.min(call.from_id, call.to_id)
    const person2 = Math.max(call.from_id, call.to_id)
    const key = `${person1}-${person2}`
    const current = totals.get(key) ?? { person1, person2, call_count: 0, total_duration: 0 }
    current.call_count += 1
    current.total_duration += call.duration
    totals.set(key, current)
    const snapshot = [...totals.values()].sort(sortPairs)
    frames.push(frame('pair', 'CASE WHEN from_id < to_id THEN from_id', 'low = ',
      `Call ${call.from_id} to ${call.to_id} is counted under the pair ${person1} and ${person2}.`, pairColumns, snapshot))
  }
  const result = [...totals.values()].sort(sortPairs)
  frames.push(frame('done', 'ORDER BY person1', 'return (pairs', `Returned ${result.length} pairs.`, pairColumns, result))
  return { input: { Calls }, result, frames }
}
