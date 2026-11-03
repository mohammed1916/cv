// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `SELECT q.id, q.year, COALESCE(n.npv, 0) AS npv
FROM Queries AS q
LEFT JOIN NPV AS n
  ON n.id = q.id AND n.year = q.year`

const PANDAS = `import pandas as pd

def npv_queries(npv, queries):
    out = queries.merge(npv, how="left", on=["id", "year"])
    out["npv"] = out["npv"].fillna(0).astype(int)
    return out[["id", "year", "npv"]]`

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

function table(rows, name, keys) {
  if (!Array.isArray(rows) || rows.length > 12) throw new Error(`${name} is a list of at most 12 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || keys.some(key => row[key] === undefined)) throw new Error(`${name} rows need ${keys.join(', ')}.`)
    return Object.fromEntries(keys.map(key => [key, row[key]]))
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with NPV and Queries lists.')
  const NPV = table(input.NPV, 'NPV', ['id', 'year', 'npv'])
  const Queries = table(input.Queries, 'Queries', ['id', 'year'])
  for (const row of NPV) {
    if (![row.id, row.year, row.npv].every(Number.isInteger)) throw new Error('NPV values must be integers.')
  }
  for (const row of Queries) {
    if (![row.id, row.year].every(Number.isInteger)) throw new Error('Query values must be integers.')
  }
  return { NPV, Queries }
}

export function buildTrace({ NPV, Queries }) {
  const lookup = new Map(NPV.map(row => [`${row.id}|${row.year}`, row.npv]))
  const columns = ['id', 'year', 'npv']
  const frames = [frame('load', 'FROM Queries', 'def npv_queries', `Read ${Queries.length} query rows. The output keeps this order.`, ['id', 'year'], Queries)]
  const out = []
  for (const query of Queries) {
    const found = lookup.get(`${query.id}|${query.year}`)
    const message = found === undefined
      ? `No NPV row for (${query.id}, ${query.year}).`
      : `NPV row for (${query.id}, ${query.year}) holds ${found}.`
    frames.push(frame('match', 'LEFT JOIN', 'merge(', message, columns, out))
    const npv = found ?? 0
    out.push({ id: query.id, year: query.year, npv })
    frames.push(frame('output', 'COALESCE', 'fillna', found === undefined ? 'COALESCE turns the missing value into 0.' : `Keep npv ${npv}.`, columns, out))
  }
  frames.push(frame('done', 'FROM Queries', 'return out', `Returned ${out.length} rows.`, columns, out))
  return { input: { NPV, Queries }, result: out, frames }
}
