// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT country, gold_medals, silver_medals, bronze_medals
FROM Olympic
ORDER BY gold_medals DESC, silver_medals DESC, bronze_medals DESC, country ASC`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def sort_medals(olympic):
    ordered = olympic.sort_values(
        ["gold_medals", "silver_medals", "bronze_medals", "country"],
        ascending=[False, False, False, True],
    )
    return ordered.to_dict("records")`
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
  { id: 'load', label: 'Load', description: 'Read the medal table as it was given.' },
  { id: 'order', label: 'Order', description: 'Sort by gold, silver, bronze (high first), then country (A to Z).' },
  { id: 'done', label: 'Result', description: 'Report the ordered medal table.' },
]

export const inputLabel = 'Object with an Olympic table'
export const complexity = 'O(n log n) to sort n countries. The visualizer caps the table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Olympic":[{"country":"Norway","gold_medals":2,"silver_medals":3,"bronze_medals":0},{"country":"Brazil","gold_medals":2,"silver_medals":1,"bronze_medals":0},{"country":"Chile","gold_medals":3,"silver_medals":0,"bronze_medals":0},{"country":"Peru","gold_medals":0,"silver_medals":5,"bronze_medals":1},{"country":"Oman","gold_medals":2,"silver_medals":2,"bronze_medals":0}]}',
}, {
  label: 'Single country',
  input: '{"Olympic":[{"country":"Norway","gold_medals":1,"silver_medals":0,"bronze_medals":0}]}',
}, {
  label: 'Equal medal counts',
  input: '{"Olympic":[{"country":"Chile","gold_medals":1,"silver_medals":1,"bronze_medals":1},{"country":"Peru","gold_medals":1,"silver_medals":1,"bronze_medals":1},{"country":"Oman","gold_medals":1,"silver_medals":1,"bronze_medals":1}]}',
}, {
  label: 'Large counts',
  input: '{"Olympic":[{"country":"Brazil","gold_medals":99,"silver_medals":99,"bronze_medals":99},{"country":"Japan","gold_medals":0,"silver_medals":0,"bronze_medals":0}]}',
}, {
  label: 'Long run: 12 countries',
  input: '{"Olympic":[{"country":"Norway","gold_medals":15,"silver_medals":1,"bronze_medals":15},{"country":"Brazil","gold_medals":10,"silver_medals":7,"bronze_medals":4},{"country":"Chile","gold_medals":1,"silver_medals":9,"bronze_medals":9},{"country":"Peru","gold_medals":1,"silver_medals":6,"bronze_medals":16},{"country":"Oman","gold_medals":11,"silver_medals":10,"bronze_medals":13},{"country":"Japan","gold_medals":5,"silver_medals":11,"bronze_medals":8},{"country":"Kenya","gold_medals":10,"silver_medals":9,"bronze_medals":9},{"country":"Mali","gold_medals":15,"silver_medals":6,"bronze_medals":16},{"country":"Italy","gold_medals":5,"silver_medals":16,"bronze_medals":0},{"country":"Spain","gold_medals":11,"silver_medals":14,"bronze_medals":3},{"country":"Egypt","gold_medals":13,"silver_medals":18,"bronze_medals":4},{"country":"Fiji","gold_medals":1,"silver_medals":5,"bronze_medals":17}]}',
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an Olympic table.')
  return { Olympic: tableRows(input, 'Olympic', ['country', 'gold_medals', 'silver_medals', 'bronze_medals']) }
}

const cols = ['country', 'gold_medals', 'silver_medals', 'bronze_medals']

export function buildTrace(input) {
  const { Olympic } = input
  const frames = [frame('load', 'FROM Olympic', 'def ', `Load ${Olympic.length} countries.`, cols, Olympic)]
  const result = [...Olympic].sort((a, b) => (b.gold_medals - a.gold_medals)
    || (b.silver_medals - a.silver_medals)
    || (b.bronze_medals - a.bronze_medals)
    || (a.country < b.country ? -1 : a.country > b.country ? 1 : 0))
  frames.push(frame('order', 'ORDER BY', 'ascending=', 'Compare gold first, then silver, then bronze, then country name.', cols, result))
  frames.push(frame('done', 'SELECT', 'return', `Return ${result.length} rows.`, cols, result))
  return { input, result, frames }
}
