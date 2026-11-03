// Knowledge-derived teaching model. The SQL, pandas code, sample rows and wording were written for this visualizer.
const SQL = `SELECT query_name,
  ROUND(AVG(rating * 1.0 / position), 2) AS quality,
  ROUND(100.0 * SUM(CASE WHEN rating < 3 THEN 1 ELSE 0 END) / COUNT(*), 2) AS poor_query_percentage
FROM Queries
WHERE query_name IS NOT NULL
GROUP BY query_name
ORDER BY query_name ASC`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def queries_quality(queries):
    named = queries.dropna(subset=["query_name"]).copy()
    named["ratio"] = named["rating"] / named["position"]
    named["is_poor"] = named["rating"] < 3
    grouped = named.groupby("query_name", as_index=False).agg(quality_raw=("ratio", "mean"), poor_share=("is_poor", "mean"))
    grouped["quality"] = grouped["quality_raw"].round(2)
    grouped["poor_query_percentage"] = (grouped["poor_share"] * 100).round(2)
    return grouped[["query_name", "quality", "poor_query_percentage"]].sort_values("query_name")`

const sqlLines = code.map(entry => entry.text)
const pythonLines = python.split('\n')

function lineOf(lines, fragment) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}

const COLUMNS_QUERIES = ['query_name', 'result', 'position', 'rating']
const COLUMNS_GROUPS = ['query_name', 'observations', 'quality', 'poor_query_percentage']

const percent = (part, whole) => Math.round((part * 10000) / whole) / 100

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.queries)) throw new Error('Use an object with a queries list.')
  if (input.queries.length > 40) throw new Error('Keep at most 40 query rows.')
  for (const row of input.queries) {
    if (row.query_name !== null && (typeof row.query_name !== 'string' || row.query_name.length === 0)) throw new Error('query_name is text or null.')
    if (!Number.isInteger(row.position) || row.position < 1) throw new Error('position is a positive integer.')
    if (!Number.isInteger(row.rating) || row.rating < 0) throw new Error('rating is a non-negative integer.')
    if (typeof row.result !== 'string') throw new Error('result is text.')
  }
  return input
}

export function buildTrace(input) {
  const rows = input.queries
  const frames = []
  const push = (phase, sql, py, message, columns, tableRows) => frames.push({
    phase,
    activeLine: lineOf(sqlLines, sql),
    pythonLine: lineOf(pythonLines, py),
    message,
    table: { columns, rows: tableRows },
  })

  push('load', 'FROM Queries', 'def queries_quality', `Load ${rows.length} query observations.`, COLUMNS_QUERIES, rows)

  const named = rows.filter(row => row.query_name !== null)
  const nulls = rows.length - named.length
  push('filter', 'WHERE query_name IS NOT NULL', 'named = queries.dropna', `${nulls} row${nulls === 1 ? '' : 's'} without a query name ${nulls === 1 ? 'is' : 'are'} left out of every group.`, COLUMNS_QUERIES, named)

  const groups = new Map()
  for (const row of named) {
    if (!groups.has(row.query_name)) groups.set(row.query_name, [])
    groups.get(row.query_name).push(row)
  }

  const summary = []
  for (const name of [...groups.keys()].sort()) {
    const members = groups.get(name)
    const ratioSum = members.reduce((sum, row) => sum + row.rating / row.position, 0)
    const poor = members.filter(row => row.rating < 3).length
    summary.push({
      query_name: name,
      observations: members.length,
      quality: Math.round((ratioSum * 100) / members.length) / 100,
      poor_query_percentage: percent(poor, members.length),
    })
    push('group', 'GROUP BY query_name', 'grouped = named.groupby', `${name}: ${members.length} observation${members.length === 1 ? '' : 's'}, quality ${summary.at(-1).quality}, poor share ${summary.at(-1).poor_query_percentage} percent.`, COLUMNS_GROUPS, [...summary])
  }

  push('order', 'ORDER BY query_name ASC', 'sort_values("query_name")', 'Sort the groups by query name.', COLUMNS_GROUPS, summary)
  push('done', 'WHERE query_name IS NOT NULL', 'return grouped', 'The result rows are ready.', COLUMNS_GROUPS, summary)

  return { input, result: summary.map(({ query_name, quality, poor_query_percentage }) => ({ query_name, quality, poor_query_percentage })), frames }
}

export const sampleInput = {
  queries: [
    { query_name: 'Dog', result: 'Beagle', position: 1, rating: 4 },
    { query_name: 'Dog', result: 'Boxer', position: 2, rating: 1 },
    { query_name: 'Dog', result: 'Terrier', position: 3, rating: 6 },
    { query_name: 'Cat', result: 'Burmese', position: 1, rating: 1 },
    { query_name: 'Cat', result: 'Abyssinian', position: 4, rating: 4 },
    { query_name: 'Bird', result: 'Macaw', position: 2, rating: 3 },
    { query_name: null, result: 'Unknown', position: 5, rating: 1 },
  ],
}

export const sampleText = JSON.stringify(sampleInput)
