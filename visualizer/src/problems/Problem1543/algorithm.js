// Knowledge-derived SQL lesson. The sample tables are invented for this visualization.
export const sql = `select lower(trim(s.product_name)) as product_name,
       date_format(s.sale_date, '%Y-%m') as sale_date,
       count(*) as total
from Sales s
group by product_name, sale_date
order by product_name, sale_date`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def monthly_totals(sales):
    work = sales.copy()
    work['product_name'] = work['product_name'].str.strip().str.lower()
    work['sale_date'] = work['sale_date'].str[:7]
    grouped = work.groupby(['product_name', 'sale_date']).size().reset_index(name='total')
    return grouped.sort_values(['product_name', 'sale_date'])`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Sales rows.' },
  { id: 'normalize', label: 'Normalize', description: 'Trim and lowercase the product names.' },
  { id: 'month', label: 'Month', description: 'Keep the year and month of each sale.' },
  { id: 'group', label: 'Group', description: 'Count the rows for each name and month.' },
  { id: 'order', label: 'Order', description: 'Sort by name, then month.' },
  { id: 'done', label: 'Result', description: 'Report the totals.' },
]

const sqlLine = text => {
  const hit = code.find(c => c.text.includes(text))
  if (!hit) throw new Error(`No SQL line contains "${text}".`)
  return hit.line
}
const pyLine = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains "${text}".`)
  return index + 1
}
const frame = (phase, sqlText, pyText, rows, output, message) => ({
  phase, activeLine: sqlLine(sqlText), pythonLine: pyLine(pyText),
  rows: rows.map(row => ({ ...row })), output: output.map(row => ({ ...row })), message,
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a sales list.')
  if (!Array.isArray(input.sales) || input.sales.length > 12) throw new Error('sales is a list of at most 12 rows.')
  for (const row of input.sales) {
    if (!row || typeof row.sale_id !== 'number' || typeof row.product_name !== 'string' || typeof row.sale_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.sale_date)) {
      throw new Error('Each sale has sale_id, product_name and a YYYY-MM-DD sale_date.')
    }
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const raw = input.sales.map(row => ({ ...row }))
  frames.push(frame('load', 'from Sales', 'def monthly_totals', raw, [], `Read ${raw.length} sales rows.`))
  const normalized = raw.map(row => ({ sale_id: row.sale_id, product_name: row.product_name.trim().toLowerCase(), sale_date: row.sale_date }))
  frames.push(frame('normalize', 'lower(trim', 'str.strip', normalized, [], 'Trim spaces and lowercase each product name.'))
  const months = normalized.map(row => ({ ...row, sale_date: row.sale_date.slice(0, 7) }))
  frames.push(frame('month', 'date_format', 'str[:7]', months, [], 'Keep only YYYY-MM from each sale date.'))
  const totals = new Map()
  for (const row of months) {
    const key = `${row.product_name}|${row.sale_date}`
    totals.set(key, { product_name: row.product_name, sale_date: row.sale_date, total: (totals.get(key)?.total ?? 0) + 1 })
  }
  const grouped = [...totals.values()]
  frames.push(frame('group', 'count(*)', 'groupby', grouped, [], `Form ${grouped.length} name and month groups.`))
  const ordered = [...grouped].sort((a, b) => (a.product_name < b.product_name ? -1 : a.product_name > b.product_name ? 1 : a.sale_date < b.sale_date ? -1 : a.sale_date > b.sale_date ? 1 : 0))
  frames.push(frame('order', 'order by product_name', 'sort_values', ordered, [], 'Sort by product name, then month.'))
  const result = ordered.map(row => ({ ...row }))
  frames.push(frame('done', 'from Sales', 'return grouped', result, result, `Returned ${result.length} rows.`))
  return { input, result, frames }
}
