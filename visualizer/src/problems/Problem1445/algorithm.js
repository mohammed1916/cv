// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `SELECT sale_date,
  SUM(CASE WHEN fruit = 'apples' THEN sold_num ELSE 0 END)
    - SUM(CASE WHEN fruit = 'oranges' THEN sold_num ELSE 0 END) AS diff
FROM Sales
GROUP BY sale_date
ORDER BY sale_date`

const PANDAS = `import pandas as pd

def fruit_diff(sales):
    signed = sales["sold_num"].where(sales["fruit"] == "apples", -sales["sold_num"])
    out = signed.groupby(sales["sale_date"]).sum().reset_index(name="diff")
    return out.sort_values("sale_date")`

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
  if (!input || !Array.isArray(input.Sales) || input.Sales.length > 12) throw new Error('Use a Sales list of at most 12 rows.')
  const Sales = input.Sales.map(row => {
    if (!row || typeof row.sale_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.sale_date)) throw new Error('sale_date uses YYYY-MM-DD.')
    if (row.fruit !== 'apples' && row.fruit !== 'oranges') throw new Error('fruit is apples or oranges.')
    if (!Number.isInteger(row.sold_num) || row.sold_num < 0) throw new Error('sold_num is a non-negative integer.')
    return { sale_date: row.sale_date, fruit: row.fruit, sold_num: row.sold_num }
  })
  return { Sales }
}

export function buildTrace({ Sales }) {
  const columns = ['sale_date', 'diff']
  const frames = [frame('load', 'FROM Sales', 'def fruit_diff', `Read ${Sales.length} sales rows.`, ['sale_date', 'fruit', 'sold_num'], Sales)]
  const dates = [...new Set(Sales.map(row => row.sale_date))].sort()
  const out = []
  for (const date of dates) {
    const rows = Sales.filter(row => row.sale_date === date)
    // A fruit that has no row on this date adds 0, the same as the CASE sums in the SQL.
    const apples = rows.filter(row => row.fruit === 'apples').reduce((sum, row) => sum + row.sold_num, 0)
    const oranges = rows.filter(row => row.fruit === 'oranges').reduce((sum, row) => sum + row.sold_num, 0)
    out.push({ sale_date: date, diff: apples - oranges })
    frames.push(frame('group', 'GROUP BY', 'groupby', `${date}: apples ${apples} minus oranges ${oranges} is ${apples - oranges}.`, columns, out))
  }
  frames.push(frame('done', 'ORDER BY', 'return out', 'Dates appear in ascending order.', columns, out))
  return { input: { Sales }, result: out, frames }
}
