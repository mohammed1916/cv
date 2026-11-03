// Knowledge-derived teaching model. The sample tables are invented for this visualization.
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

export const sql = `SELECT DISTINCT author_id AS id
FROM Views
WHERE author_id = viewer_id
ORDER BY id`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def article_views_i(views):
    own = views[views["author_id"] == views["viewer_id"]]
    ids = own[["author_id"]].drop_duplicates()
    ids = ids.rename(columns={"author_id": "id"})
    return ids.sort_values("id")`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the view rows.' },
  { id: 'filter', label: 'Filter', description: 'Keep views where the author is the viewer.' },
  { id: 'distinct', label: 'Distinct', description: 'Keep one id per author.' },
  { id: 'order', label: 'Order', description: 'Sort the ids ascending.' },
  { id: 'done', label: 'Result', description: 'Output the ids.' },
]
export const inputLabel = 'JSON object with a views table'
export const complexity = 'Linear in the view rows, plus sorting the distinct author ids.'
const COLS = ['article_id', 'author_id', 'viewer_id', 'view_date']
const SAMPLE = { views: [
  { article_id: 11, author_id: 4, viewer_id: 9, view_date: '2019-08-01' },
  { article_id: 12, author_id: 8, viewer_id: 8, view_date: '2019-08-01' },
  { article_id: 12, author_id: 8, viewer_id: 6, view_date: '2019-08-02' },
  { article_id: 11, author_id: 4, viewer_id: 4, view_date: '2019-08-03' },
  { article_id: 13, author_id: 2, viewer_id: 2, view_date: '2019-08-03' },
  { article_id: 14, author_id: 2, viewer_id: 6, view_date: '2019-08-04' },
] }
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }]

export function parseInput(text) {
  const input = parseJsonObject(text)
  requireRows(input, 'views', COLS, 20)
  return input
}

export function buildTrace(input) {
  const views = input.views
  const frames = [frameAt('load', 'FROM Views', 'def article_views_i', `Load ${views.length} view rows.`, COLS, views)]
  const own = views.filter(row => row.author_id === row.viewer_id)
  frames.push(frameAt('filter', 'WHERE author_id = viewer_id', 'own = views', `${own.length} views were made by the author themself.`, COLS, own))
  const ids = [...new Set(own.map(row => row.author_id))].map(id => ({ id }))
  frames.push(frameAt('distinct', 'SELECT DISTINCT author_id', 'ids = own', 'Keep one row for each author.', ['id'], ids))
  const result = [...ids].sort((a, b) => a.id - b.id)
  frames.push(frameAt('order', 'ORDER BY id', 'return ids', 'Sort the ids ascending.', ['id'], result))
  frames.push(frameAt('done', 'SELECT DISTINCT author_id', 'return ids.sort_values("id")', 'Output the author ids.', ['id'], result))
  return { input, result, frames }
}
