// Knowledge-derived teaching variant (not the official statement).
const SQL = `WITH priced AS (
  SELECT s.sale_id, s.sale_date, p.category, s.quantity * p.price AS revenue
  FROM sales s
  JOIN products p ON p.product_id = s.product_id
), seasoned AS (
  SELECT sale_id, category, revenue,
    CASE WHEN MONTH(sale_date) IN (12, 1, 2) THEN 'Winter'
         WHEN MONTH(sale_date) IN (3, 4, 5) THEN 'Spring'
         WHEN MONTH(sale_date) IN (6, 7, 8) THEN 'Summer'
         ELSE 'Autumn' END AS season
  FROM priced
), totals AS (
  SELECT season, category, SUM(revenue) AS revenue
  FROM seasoned
  GROUP BY season, category
), ranked AS (
  SELECT season, category, revenue,
    ROW_NUMBER() OVER (PARTITION BY season ORDER BY revenue DESC, category ASC) AS rn
  FROM totals
)
SELECT season, category, revenue
FROM ranked
WHERE rn = 1
ORDER BY CASE season WHEN 'Winter' THEN 1 WHEN 'Spring' THEN 2 WHEN 'Summer' THEN 3 ELSE 4 END;`

const PYTHON = `def seasonal_leaders(sales, products):
    priced = sales.merge(products, on='product_id')
    priced['revenue'] = priced.quantity * priced.price
    priced['season'] = priced.sale_date.dt.month.map(SEASON)
    totals = priced.groupby(['season', 'category'], as_index=False).revenue.sum()
    totals = totals.sort_values(['season', 'revenue', 'category'], ascending=[True, False, True])
    leaders = totals.drop_duplicates('season')
    return leaders.sort_values('season', key=SEASON_ORDER.get)`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON
const pyLines = PYTHON.split('\n')
const SEASON_ORDER = ['Winter', 'Spring', 'Summer', 'Autumn']

function at(text) {
  const found = code.find(line => line.text.includes(text))
  if (!found) throw new Error(`Missing SQL line: ${text}`)
  return found.line
}

function pyAt(text) {
  const index = pyLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

function seasonOf(month) {
  if (month === 12 || month <= 2) return 'Winter'
  if (month <= 5) return 'Spring'
  if (month <= 8) return 'Summer'
  return 'Autumn'
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.sales) || !Array.isArray(input.products)) {
    throw new Error('Use an object with sales and products lists.')
  }
  if (input.sales.length > 12 || input.products.length > 8) throw new Error('Use at most 12 sales and 8 products.')
  const prices = new Map()
  for (const row of input.products) {
    if (!Number.isInteger(row.product_id) || typeof row.category !== 'string' || !Number.isInteger(row.price) || row.price < 0) {
      throw new Error('Each product needs an integer product_id, a category text and a whole price of 0 or more.')
    }
    prices.set(row.product_id, row)
  }
  for (const row of input.sales) {
    if (!Number.isInteger(row.sale_id) || !prices.has(row.product_id)) throw new Error('Each sale needs an integer sale_id and a known product_id.')
    if (typeof row.sale_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.sale_date)) throw new Error('sale_date must look like YYYY-MM-DD.')
    if (!Number.isInteger(row.quantity) || row.quantity < 1) throw new Error('quantity must be a whole number of at least 1.')
  }
  return {
    sales: input.sales.map(row => ({ ...row })),
    products: input.products.map(row => ({ ...row })),
  }
}

export function buildTrace(input) {
  const { sales, products } = input
  const priceOf = Object.fromEntries(products.map(row => [row.product_id, row]))
  const frames = []
  const step = (phase, sqlKey, pyKey, message, rows, result = []) => frames.push({
    phase, activeLine: at(sqlKey), pythonLine: pyAt(pyKey), message,
    rows: rows.map(row => ({ ...row })), result: result.map(row => ({ ...row })),
  })

  step('load', 'FROM sales s', 'def seasonal_leaders', `Load ${sales.length} sales and ${products.length} products.`, sales)

  const priced = sales.map(row => {
    const product = priceOf[row.product_id]
    return { sale_id: row.sale_id, sale_date: row.sale_date, category: product.category, revenue: row.quantity * product.price }
  })
  step('join', 'JOIN products p', "priced['revenue']", 'Attach each sale its category and revenue, quantity times price.', priced)

  const seasoned = priced.map(row => ({ ...row, season: seasonOf(Number(row.sale_date.slice(5, 7))) }))
  step('season', 'CASE WHEN MONTH', "priced['season']", 'Map each sale month to Winter, Spring, Summer or Autumn.', seasoned)

  const totalMap = new Map()
  for (const row of seasoned) {
    const key = `${row.season}|${row.category}`
    totalMap.set(key, { season: row.season, category: row.category, revenue: (totalMap.get(key)?.revenue || 0) + row.revenue })
  }
  const totals = [...totalMap.values()]
  step('total', 'GROUP BY season, category', 'totals = ', 'Add up revenue for each season and category pair.', totals)

  const result = []
  for (const season of SEASON_ORDER) {
    const own = totals.filter(row => row.season === season)
    if (own.length === 0) continue
    own.sort((a, b) => b.revenue - a.revenue || (a.category < b.category ? -1 : a.category > b.category ? 1 : 0))
    const leader = own[0]
    result.push({ season, category: leader.category, revenue: leader.revenue })
    const tied = own.filter(row => row.revenue === leader.revenue).length
    step('pick', 'ROW_NUMBER() OVER', 'drop_duplicates', tied > 1
      ? `${season}: ${tied} categories tie at ${leader.revenue}; ${leader.category} wins alphabetically.`
      : `${season}: ${leader.category} leads with ${leader.revenue}.`, own, result)
  }

  step('output', 'ORDER BY CASE season', 'return leaders', `Return ${result.length} seasonal leaders.`, totals, result)
  return { input: { sales, products }, result, frames }
}
