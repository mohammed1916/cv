// Teaching model. The sample tables are invented for this visualization.
export function snap(rows) {
  return rows.map(row => ({ ...row }))
}

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export function parseJsonObject(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object whose keys name the tables.')
  return input
}

export function requireRows(input, name, columns, maxRows = 12) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length > maxRows) throw new Error(`${name} must be a list of at most ${maxRows} rows.`)
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${name} row ${index + 1} must be an object.`)
    columns.forEach(column => { if (!(column in row)) throw new Error(`${name} row ${index + 1} needs ${column}.`) })
  })
  return rows
}

export const sql = `SELECT state,
       GROUP_CONCAT(city ORDER BY city SEPARATOR ', ') AS cities
FROM Cities
GROUP BY state
ORDER BY state`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def cities_in_each_state(cities):
    ordered = cities.sort_values(["state", "city"])
    joined = ordered.groupby("state")["city"].agg(", ".join).reset_index()
    return joined.sort_values("state")`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the city rows.' },
  { id: 'order', label: 'Order', description: 'Sort the rows by state, then by city.' },
  { id: 'group', label: 'Group', description: 'Collect and join the cities of each state.' },
  { id: 'done', label: 'Result', description: 'Output one row per state.' },
]

const COLS = ['state', 'city']
const RESULT_COLS = ['state', 'cities']
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

export function parseInput(text) {
  const input = parseJsonObject(text)
  const rows = requireRows(input, 'Cities', COLS)
  const seen = new Set()
  for (const row of rows) {
    if (typeof row.state !== 'string' || typeof row.city !== 'string') throw new Error('state and city are text.')
    const key = `${row.state}|${row.city}`
    if (seen.has(key)) throw new Error('Each state and city pair appears only once.')
    seen.add(key)
  }
  return input
}

export function buildTrace(input) {
  const rows = input.Cities
  const frames = [frameAt('load', 'SELECT state', 'def cities_in_each_state', `Read ${rows.length} city rows.`, COLS, rows)]
  const ordered = [...rows].sort((a, b) => cmp(a.state, b.state) || cmp(a.city, b.city))
  frames.push(frameAt('order', 'ORDER BY city', 'sort_values(["state", "city"])', 'Sort by state, then by city inside each state.', COLS, ordered))
  const groups = new Map()
  for (const row of ordered) groups.set(row.state, [...(groups.get(row.state) || []), row.city])
  const grouped = [...groups].map(([state, cities]) => ({ state, cities: cities.join(', ') }))
  frames.push(frameAt('group', 'GROUP BY state', 'groupby("state")', `Join the cities of ${grouped.length} states into one text each.`, RESULT_COLS, grouped))
  const result = [...grouped].sort((a, b) => cmp(a.state, b.state))
  frames.push(frameAt('done', 'ORDER BY state', 'sort_values("state")', 'Output one row per state, in state order.', RESULT_COLS, result))
  return { input, result, frames }
}
