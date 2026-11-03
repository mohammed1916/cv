// Knowledge-derived teaching model. Sample tables and wording are original.
const lineIn = (source, text) => {
  const index = source.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No line contains: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Sales', description: 'Start from the sales periods.' },
  { id: 'expand', label: 'Days', description: 'Each inclusive calendar day of a period carries the daily amount.' },
  { id: 'group', label: 'Group', description: 'Sum the day amounts for each product and year.' },
  { id: 'join', label: 'Name', description: 'Attach the product name. Products with no sales drop out.' },
  { id: 'order', label: 'Order', description: 'Sort by product id, then year.' },
  { id: 'done', label: 'Result', description: 'Return the four requested columns.' },
]

export const sql = `
WITH RECURSIVE day_list AS (
  SELECT product_id, period_start AS day, period_end, average_daily_sales FROM Sales
  UNION ALL
  SELECT product_id, day + INTERVAL 1 DAY, period_end, average_daily_sales
  FROM day_list WHERE day < period_end)
SELECT p.product_id, p.product_name, YEAR(d.day) AS report_year,
  SUM(d.average_daily_sales) AS total_amount
FROM day_list d JOIN Product p ON p.product_id = d.product_id
GROUP BY p.product_id, p.product_name, YEAR(d.day)
ORDER BY p.product_id, report_year`.trim()

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `
def yearly_sales(product, sales):
    rows = []
    for s in sales.itertuples():
        for day in pd.date_range(s.period_start, s.period_end):
            rows.append((s.product_id, day.year, s.average_daily_sales))
    out = pd.DataFrame(rows, columns=['product_id', 'report_year', 'daily'])
    out = out.groupby(['product_id', 'report_year'], as_index=False).daily.sum().rename(columns={'daily': 'total_amount'})
    out = out.merge(product, on='product_id')
    return out[['product_id', 'product_name', 'report_year', 'total_amount']].sort_values(['product_id', 'report_year'])`.trim()

const S = text => lineIn(sql, text)
const P = text => lineIn(python, text)
const frame = (phase, sqlText, pyText, message, caption, rows) => ({
  phase, activeLine: S(sqlText), pythonLine: P(pyText), message, caption, rows: rows.map(row => ({ ...row })),
})

const DATE = /^\d{4}-\d{2}-\d{2}$/

export function addDays(iso, count) {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + count)
  return date.toISOString().slice(0, 10)
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Product) || !Array.isArray(input.Sales)) throw new Error('Use an object with Product and Sales lists.')
  const { Product, Sales } = input
  if (Product.length < 1 || Product.length > 8 || Sales.length > 6) throw new Error('Keep up to 8 products and 6 sales periods.')
  const ids = new Set()
  for (const row of Product) {
    if (!Number.isInteger(row.product_id) || ids.has(row.product_id) || typeof row.product_name !== 'string') throw new Error('Each product needs a unique integer id and a name.')
    ids.add(row.product_id)
  }
  for (const row of Sales) {
    if (!ids.has(row.product_id)) throw new Error('Each sale must name an existing product_id.')
    if (!DATE.test(row.period_start) || !DATE.test(row.period_end)) throw new Error('Dates use YYYY-MM-DD.')
    if (row.period_start < '1900-01-01' || row.period_end > '2100-12-31') throw new Error('Years must be between 1900 and 2100.')
    if (row.period_start > row.period_end) throw new Error('period_start must not be after period_end.')
    if (!Number.isInteger(row.average_daily_sales) || row.average_daily_sales < 0) throw new Error('average_daily_sales is a whole number of 0 or more.')
    let length = 0
    for (let day = row.period_start; day <= row.period_end; day = addDays(day, 1)) length += 1
    if (length > 60) throw new Error('Keep each period to 60 days so the day rows stay readable.')
  }
  return input
}

export function buildTrace(input) {
  const { Product, Sales } = input
  const names = new Map(Product.map(row => [row.product_id, row.product_name]))
  const frames = []
  frames.push(frame('load', 'FROM Sales', 'def yearly_sales',
    `Start with ${Sales.length} sales periods. Each one covers an inclusive range of days.`, 'Sales periods', Sales))

  const days = []
  for (const sale of Sales) {
    const own = []
    for (let day = sale.period_start; day <= sale.period_end; day = addDays(day, 1)) {
      own.push({ product_id: sale.product_id, day, daily: sale.average_daily_sales })
    }
    days.push(...own)
    frames.push(frame('expand', 'day + INTERVAL', 'pd.date_range',
      `${sale.period_start} to ${sale.period_end} contributes ${own.length} day${own.length === 1 ? '' : 's'} at ${sale.average_daily_sales} each.`,
      'Day rows so far', days))
  }

  const groups = new Map()
  for (const row of days) {
    const year = Number(row.day.slice(0, 4))
    const key = `${row.product_id}|${year}`
    const entry = groups.get(key) || { product_id: row.product_id, report_year: year, total_amount: 0 }
    entry.total_amount += row.daily
    groups.set(key, entry)
  }
  const grouped = [...groups.values()]
  frames.push(frame('group', 'GROUP BY p.product_id', 'groupby',
    'Each product and year becomes one row. Leap years need no special case because every real day is counted.', 'Totals by product and year', grouped))

  const joined = grouped.map(row => ({ ...row, product_name: names.get(row.product_id) }))
    .map(({ product_id, product_name, report_year, total_amount }) => ({ product_id, product_name, report_year, total_amount }))
  frames.push(frame('join', 'JOIN Product', 'out.merge(product',
    'Attach the product name from the Product table.', 'Named totals', joined))

  const sorted = [...joined].sort((a, b) => a.product_id - b.product_id || a.report_year - b.report_year)
  frames.push(frame('order', 'ORDER BY p.product_id', 'sort_values', 'Sort by product id, then report year.', 'Sorted rows', sorted))
  frames.push(frame('done', 'SELECT p.product_id', 'return out[', 'The output has product_id, product_name, report_year and total_amount.', 'Result', sorted))
  return { input, result: sorted, frames }
}
