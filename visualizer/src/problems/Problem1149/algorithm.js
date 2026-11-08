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

export const sql = `SELECT DISTINCT viewer_id AS id
FROM (
  SELECT viewer_id, view_date
  FROM Views
  GROUP BY viewer_id, view_date
  HAVING COUNT(DISTINCT article_id) > 1
) AS busy
ORDER BY id`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def article_views_ii(views):
    per_day = views.groupby(["viewer_id", "view_date"])["article_id"].nunique()
    busy = per_day[per_day > 1].reset_index()
    ids = busy[["viewer_id"]].drop_duplicates()
    ids = ids.rename(columns={"viewer_id": "id"})
    return ids.sort_values("id")`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the view rows.' },
  { id: 'group', label: 'Group', description: 'Count distinct articles per viewer and date.' },
  { id: 'filter', label: 'Filter', description: 'Keep viewer-days with more than one article.' },
  { id: 'distinct', label: 'Distinct', description: 'Keep one id per viewer.' },
  { id: 'order', label: 'Order', description: 'Sort the ids ascending.' },
  { id: 'done', label: 'Result', description: 'Output the ids.' },
]
export const inputLabel = 'JSON object with a views table'
export const complexity = 'Linear in the view rows, with one hash group per viewer and date.'
const COLS = ['article_id', 'author_id', 'viewer_id', 'view_date']
const SAMPLE = { views: [
  { article_id: 7, author_id: 2, viewer_id: 11, view_date: '2020-03-05' },
  { article_id: 8, author_id: 2, viewer_id: 11, view_date: '2020-03-05' },
  { article_id: 7, author_id: 2, viewer_id: 12, view_date: '2020-03-06' },
  { article_id: 7, author_id: 2, viewer_id: 12, view_date: '2020-03-06' },
  { article_id: 9, author_id: 4, viewer_id: 13, view_date: '2020-03-07' },
  { article_id: 9, author_id: 4, viewer_id: 13, view_date: '2020-03-08' },
  { article_id: 8, author_id: 4, viewer_id: 14, view_date: '2020-03-09' },
  { article_id: 9, author_id: 4, viewer_id: 14, view_date: '2020-03-09' },
] }
export const examples = [{ label: 'Teaching sample', input: JSON.stringify(SAMPLE) }, { label: 'One article viewed twice counts once', input: '{"views":[{"article_id":4,"author_id":1,"viewer_id":2,"view_date":"2020-04-01"},{"article_id":4,"author_id":1,"viewer_id":2,"view_date":"2020-04-01"}]}' }, { label: 'Exactly two articles on one day', input: '{"views":[{"article_id":4,"author_id":1,"viewer_id":2,"view_date":"2020-04-01"},{"article_id":5,"author_id":3,"viewer_id":2,"view_date":"2020-04-01"},{"article_id":6,"author_id":1,"viewer_id":2,"view_date":"2020-04-02"}]}' }, { label: 'Same viewer on separate days', input: '{"views":[{"article_id":4,"author_id":1,"viewer_id":3,"view_date":"2020-04-01"},{"article_id":5,"author_id":3,"viewer_id":3,"view_date":"2020-04-02"}]}' }, { label: 'Long run: 20 views', input: '{"views":[{"article_id":5,"author_id":1,"viewer_id":3,"view_date":"2020-04-02"},{"article_id":4,"author_id":5,"viewer_id":5,"view_date":"2020-04-02"},{"article_id":4,"author_id":1,"viewer_id":3,"view_date":"2020-04-02"},{"article_id":3,"author_id":2,"viewer_id":3,"view_date":"2020-04-02"},{"article_id":3,"author_id":5,"viewer_id":3,"view_date":"2020-04-04"},{"article_id":2,"author_id":4,"viewer_id":4,"view_date":"2020-04-03"},{"article_id":5,"author_id":3,"viewer_id":5,"view_date":"2020-04-02"},{"article_id":1,"author_id":2,"viewer_id":5,"view_date":"2020-04-01"},{"article_id":3,"author_id":2,"viewer_id":4,"view_date":"2020-04-04"},{"article_id":3,"author_id":4,"viewer_id":3,"view_date":"2020-04-04"},{"article_id":4,"author_id":5,"viewer_id":2,"view_date":"2020-04-01"},{"article_id":4,"author_id":3,"viewer_id":3,"view_date":"2020-04-04"},{"article_id":6,"author_id":5,"viewer_id":3,"view_date":"2020-04-04"},{"article_id":2,"author_id":1,"viewer_id":4,"view_date":"2020-04-02"},{"article_id":5,"author_id":3,"viewer_id":4,"view_date":"2020-04-04"},{"article_id":2,"author_id":2,"viewer_id":5,"view_date":"2020-04-01"},{"article_id":6,"author_id":1,"viewer_id":4,"view_date":"2020-04-01"},{"article_id":6,"author_id":5,"viewer_id":1,"view_date":"2020-04-01"},{"article_id":2,"author_id":4,"viewer_id":5,"view_date":"2020-04-03"},{"article_id":5,"author_id":5,"viewer_id":4,"view_date":"2020-04-04"}]}' }]

export function parseInput(text) {
  const input = parseJsonObject(text)
  requireRows(input, 'views', COLS, 20)
  return input
}

export function buildTrace(input) {
  const views = input.views
  const frames = [frameAt('load', 'FROM Views', 'def article_views_ii', `Load ${views.length} view rows.`, COLS, views)]
  const groups = new Map()
  for (const row of views) {
    const key = `${row.viewer_id}|${row.view_date}`
    const group = groups.get(key) || { viewer_id: row.viewer_id, view_date: row.view_date, articles: new Set() }
    group.articles.add(row.article_id)
    groups.set(key, group)
  }
  const grouped = [...groups.values()].map(group => ({ viewer_id: group.viewer_id, view_date: group.view_date, distinct_articles: group.articles.size }))
  frames.push(frameAt('group', 'GROUP BY viewer_id, view_date', 'per_day = views', 'Count the distinct articles each viewer saw on each date.', ['viewer_id', 'view_date', 'distinct_articles'], grouped))
  const busy = grouped.filter(row => row.distinct_articles > 1)
  frames.push(frameAt('filter', 'HAVING COUNT', 'busy = per_day', 'Two views of one article on one day count as a single article.', ['viewer_id', 'view_date', 'distinct_articles'], busy))
  const ids = [...new Set(busy.map(row => row.viewer_id))].map(id => ({ id }))
  frames.push(frameAt('distinct', 'SELECT DISTINCT viewer_id', 'ids = busy', 'Keep one row per qualifying viewer.', ['id'], ids))
  const result = [...ids].sort((a, b) => a.id - b.id)
  frames.push(frameAt('order', 'ORDER BY id', 'sort_values("id")', 'Sort the ids ascending.', ['id'], result))
  frames.push(frameAt('done', 'SELECT DISTINCT viewer_id', 'return ids', 'Output the viewer ids.', ['id'], result))
  return { input, result, frames }
}
