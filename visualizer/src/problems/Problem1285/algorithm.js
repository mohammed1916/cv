const SQL = `WITH numbered AS (
  SELECT log_id,
    log_id - ROW_NUMBER() OVER (ORDER BY log_id) AS grp
  FROM Logs
)
SELECT MIN(log_id) AS start_id, MAX(log_id) AS end_id
FROM numbered
GROUP BY grp
ORDER BY start_id;`

const PY = `import pandas as pd

def continuous_ranges(logs):
    ordered = logs.sort_values("log_id").reset_index(drop=True)
    gap = ordered["log_id"].diff().fillna(1) != 1
    ordered["grp"] = gap.cumsum()
    out = ordered.groupby("grp")["log_id"].agg(start_id="min", end_id="max").reset_index(drop=True)
    return out.sort_values("start_id")
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
  { id: 'number', label: 'Sort', description: 'Put the ids in increasing order.' },
  { id: 'start', label: 'New run', description: 'An id that is not one more than the previous id starts a run.' },
  { id: 'extend', label: 'Extend', description: 'An id one above the previous id continues the run.' },
  { id: 'done', label: 'Result', description: 'Runs listed by their first id.' },
]
export const sample = {
  logs: [8, 3, 1, 2, 6, 5, 10, 12, 11, 13],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.logs)) throw new Error('Provide a logs array of ids.')
  if (new Set(input.logs).size !== input.logs.length) throw new Error('log_id values must be unique.')
  if (input.logs.some(id => !Number.isInteger(id))) throw new Error('Every log_id must be an integer.')
  return input
}

export function buildTrace(input) {
  const ids = [...input.logs].sort((a, b) => a - b)
  const frames = [frame('number', 'FROM Logs', 'ordered = logs.sort_values', 'Ids sorted in increasing order.', ids.map(log_id => ({ log_id })))]
  const runs = []
  for (const id of ids) {
    const run = runs.at(-1)
    if (run && id === run.end_id + 1) {
      run.end_id = id
      frames.push(frame('extend', 'log_id - ROW_NUMBER', 'ordered["grp"] =', `${id} is one more than ${id - 1}, so the run grows.`, runs))
    } else {
      runs.push({ start_id: id, end_id: id })
      frames.push(frame('start', 'ROW_NUMBER() OVER', 'gap = ', `${id} does not follow the previous id, so a new run starts.`, runs))
    }
  }
  frames.push(frame('done', 'GROUP BY grp', 'return out', 'Runs listed by start id.', runs))
  return { input, result: runs, frames }
}
