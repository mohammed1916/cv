// Knowledge-derived walkthrough: every sale is priced by the one range that contains its date, then revenue and units are summed per product.
export const phases = [
  { id: 'load', label: 'Products', description: 'List each product once.' },
  { id: 'match', label: 'Match', description: 'Each sale takes the price of the range containing its date.' },
  { id: 'group', label: 'Average', description: 'Revenue divided by units gives the weighted average.' },
  { id: 'done', label: 'Result', description: 'Round to two decimals and report each product.' },
]

const SQL_SOURCE = `WITH priced AS (
  SELECT u.product_id, u.purchase_date, u.units, p.price
  FROM UnitsSold u
  JOIN Prices p ON p.product_id = u.product_id
    AND u.purchase_date BETWEEN p.start_date AND p.end_date
)
SELECT pr.product_id,
  ROUND(IFNULL(SUM(priced.price * priced.units) / NULLIF(SUM(priced.units), 0), 0), 2) AS average_price
FROM (SELECT DISTINCT product_id FROM Prices) pr
LEFT JOIN priced ON priced.product_id = pr.product_id
GROUP BY pr.product_id
ORDER BY pr.product_id;`

const PY_SOURCE = `import pandas as pd

def average_selling_price(prices, units_sold):
    m = units_sold.merge(prices, on="product_id")
    m = m[(m.purchase_date >= m.start_date) & (m.purchase_date <= m.end_date)]
    m = m.assign(revenue=m.price * m.units)
    g = m.groupby("product_id")[["revenue", "units"]].sum()
    avg = (g.revenue / g.units).round(2)
    out = prices[["product_id"]].drop_duplicates()
    out["average_price"] = out.product_id.map(avg).fillna(0)
    return out.sort_values("product_id").reset_index(drop=True)`

const SQL_LINES = SQL_SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const PY_LINES = PY_SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
export const code = SQL_LINES
export const sql = SQL_SOURCE
export const python = PY_SOURCE

const PRODUCT_COLUMNS = ['product_id']
const SALE_COLUMNS = ['product_id', 'purchase_date', 'units', 'price', 'revenue']
const RESULT_COLUMNS = ['product_id', 'average_price']
const at = (lines, fragment) => {
  const hit = lines.find(line => line.text.includes(fragment))
  if (!hit) throw new Error(`No line contains "${fragment}"`)
  return hit.line
}
const copy = rows => JSON.parse(JSON.stringify(rows))
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/
const inRange = (day, range) => day >= range.start_date && day <= range.end_date

export function parseInput(text) {
  const input = JSON.parse(text)
  const { prices, units_sold: sales } = input ?? {}
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 12) throw new Error('prices has 1 to 12 rows.')
  if (!Array.isArray(sales) || sales.length > 12) throw new Error('units_sold has at most 12 rows.')
  for (const range of prices) {
    if (!Number.isInteger(range?.product_id) || !ISO_DAY.test(range.start_date ?? '') || !ISO_DAY.test(range.end_date ?? '')) throw new Error('Each price needs an integer product_id and YYYY-MM-DD dates.')
    if (range.start_date > range.end_date) throw new Error('A price range starts on or before it ends.')
    if (!Number.isInteger(range.price) || range.price < 0 || range.price > 1000) throw new Error('Prices are integers from 0 to 1000.')
  }
  for (const a of prices) {
    for (const b of prices) {
      if (a !== b && a.product_id === b.product_id && a.start_date <= b.end_date && b.start_date <= a.end_date) throw new Error('Price ranges of one product must not overlap.')
    }
  }
  for (const sale of sales) {
    if (!Number.isInteger(sale?.product_id) || !ISO_DAY.test(sale.purchase_date ?? '') || !Number.isInteger(sale.units) || sale.units < 1 || sale.units > 1000) throw new Error('Each sale needs an integer product_id, a YYYY-MM-DD purchase_date and 1 to 1000 units.')
    const hits = prices.filter(range => range.product_id === sale.product_id && inRange(sale.purchase_date, range))
    if (hits.length !== 1) throw new Error('Each sale must fall in exactly one price range of its product.')
  }
  return {
    prices: prices.map(range => ({ product_id: range.product_id, start_date: range.start_date, end_date: range.end_date, price: range.price })),
    units_sold: sales.map(sale => ({ product_id: sale.product_id, purchase_date: sale.purchase_date, units: sale.units })),
  }
}

export function buildTrace(input) {
  const { prices, units_sold: sales } = input
  const products = [...new Set(prices.map(range => range.product_id))].sort((a, b) => a - b)
  const frames = []
  const priced = []
  const push = (phase, sqlFragment, pyFragment, message, rows, columns) => frames.push({
    phase, activeLine: at(SQL_LINES, sqlFragment), pythonLine: at(PY_LINES, pyFragment),
    message, columns, rows: copy(rows),
  })
  push('load', 'FROM (SELECT DISTINCT product_id', 'def average_selling_price', `${products.length} products to report.`, products.map(id => ({ product_id: id })), PRODUCT_COLUMNS)
  for (const sale of sales) {
    const range = prices.find(entry => entry.product_id === sale.product_id && inRange(sale.purchase_date, entry))
    priced.push({ product_id: sale.product_id, purchase_date: sale.purchase_date, units: sale.units, price: range.price, revenue: range.price * sale.units })
    push('match', 'AND u.purchase_date BETWEEN', 'm = m[(m.purchase', `${sale.purchase_date} falls in a range priced ${range.price}; ${sale.units} units bring ${range.price * sale.units}.`, priced, SALE_COLUMNS)
  }
  const summary = products.map(id => {
    const mine = priced.filter(row => row.product_id === id)
    const units = mine.reduce((sum, row) => sum + row.units, 0)
    const revenue = mine.reduce((sum, row) => sum + row.revenue, 0)
    return { product_id: id, average_price: units ? Math.round((revenue / units) * 100) / 100 : 0 }
  })
  push('group', 'GROUP BY pr.product_id', 'avg = (g.revenue', 'Divide revenue by units for each product; no sales means zero.', summary, RESULT_COLUMNS)
  push('done', 'ORDER BY pr.product_id', 'return out.sort_values', 'Report each product with its weighted average price.', summary, RESULT_COLUMNS)
  return { input, result: copy(summary), columns: RESULT_COLUMNS, frames }
}
