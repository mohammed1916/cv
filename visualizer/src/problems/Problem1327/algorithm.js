// Walkthrough of the query stages on invented sample rows. The sample tables are invented.
const SQL_TEXT = `SELECT p.product_name, SUM(o.unit) AS unit
FROM Products AS p
JOIN Orders AS o ON o.product_id = p.product_id
WHERE o.order_date >= '2020-02-01' AND o.order_date < '2020-03-01'
GROUP BY p.product_id, p.product_name
HAVING SUM(o.unit) >= 100
ORDER BY p.product_name`

export const sql = SQL_TEXT
export const code = SQL_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def products_in_period(products, orders):
    feb = orders[(orders["order_date"] >= "2020-02-01") & (orders["order_date"] < "2020-03-01")]
    joined = feb.merge(products, on="product_id")
    totals = joined.groupby("product_name", as_index=False)["unit"].sum()
    kept = totals[totals["unit"] >= 100]
    return kept.sort_values("product_name")
`

export const phases = [
  { id: 'load', label: 'Catalogue', description: 'Read the product list.' },
  { id: 'period', label: 'February orders', description: 'Keep orders dated inside the month.' },
  { id: 'group', label: 'Totals', description: 'Add the units for each product.' },
  { id: 'having', label: 'Threshold', description: 'Keep totals of at least 100 units.' },
  { id: 'done', label: 'Result', description: 'Show the rows the query returns.' },
]

export const sample = {
  Products: [
    { product_id: 1, product_name: 'Kitchen', product_category: 'home' },
    { product_id: 2, product_name: 'Pens', product_category: 'office' },
    { product_id: 3, product_name: 'Desk', product_category: 'office' },
    { product_id: 4, product_name: 'Lamp', product_category: 'home' },
  ],
  Orders: [
    { product_id: 1, order_date: '2020-02-05', unit: 60 },
    { product_id: 1, order_date: '2020-02-20', unit: 45 },
    { product_id: 1, order_date: '2020-03-01', unit: 200 },
    { product_id: 2, order_date: '2020-02-10', unit: 99 },
    { product_id: 2, order_date: '2020-02-11', unit: 1 },
    { product_id: 3, order_date: '2020-01-31', unit: 500 },
    { product_id: 3, order_date: '2020-02-28', unit: 20 },
    { product_id: 4, order_date: '2020-02-01', unit: 150 },
    { product_id: 4, order_date: '2020-02-29', unit: 3 },
  ],
}

export const examples = [{ label: 'Four products', input: JSON.stringify(sample) },
    { label: "Single order", input: "{\"Products\":[{\"product_id\":1,\"product_name\":\"Kitchen\",\"product_category\":\"home\"}],\"Orders\":[{\"product_id\":1,\"order_date\":\"2020-02-05\",\"unit\":10}]}" },
    { label: "Equal February totals", input: "{\"Products\":[{\"product_id\":1,\"product_name\":\"Kitchen\",\"product_category\":\"home\"},{\"product_id\":2,\"product_name\":\"Pens\",\"product_category\":\"office\"}],\"Orders\":[{\"product_id\":1,\"order_date\":\"2020-02-05\",\"unit\":10},{\"product_id\":2,\"order_date\":\"2020-02-06\",\"unit\":10}]}" },
    { label: "Twelve orders, large units", input: "{\"Products\":[{\"product_id\":1,\"product_name\":\"Desk\",\"product_category\":\"office\"}],\"Orders\":[{\"product_id\":1,\"order_date\":\"2020-01-15\",\"unit\":1000},{\"product_id\":1,\"order_date\":\"2020-02-15\",\"unit\":1000},{\"product_id\":1,\"order_date\":\"2020-03-15\",\"unit\":1000},{\"product_id\":1,\"order_date\":\"2020-04-15\",\"unit\":1000},{\"product_id\":1,\"order_date\":\"2020-05-15\",\"unit\":1000},{\"product_id\":1,\"order_date\":\"2020-06-15\",\"unit\":1000},{\"product_id\":1,\"order_date\":\"2020-07-15\",\"unit\":1000},{\"product_id\":1,\"order_date\":\"2020-08-15\",\"unit\":1000},{\"product_id\":1,\"order_date\":\"2020-09-15\",\"unit\":1000},{\"product_id\":1,\"order_date\":\"2020-10-15\",\"unit\":1000},{\"product_id\":1,\"order_date\":\"2020-11-15\",\"unit\":1000},{\"product_id\":1,\"order_date\":\"2020-12-15\",\"unit\":1000}]}" },
    { label: "Long run: twelve products", input: "{\"Products\":[{\"product_id\":1,\"product_name\":\"Item1\",\"product_category\":\"misc\"},{\"product_id\":2,\"product_name\":\"Item2\",\"product_category\":\"misc\"},{\"product_id\":3,\"product_name\":\"Item3\",\"product_category\":\"misc\"},{\"product_id\":4,\"product_name\":\"Item4\",\"product_category\":\"misc\"},{\"product_id\":5,\"product_name\":\"Item5\",\"product_category\":\"misc\"},{\"product_id\":6,\"product_name\":\"Item6\",\"product_category\":\"misc\"},{\"product_id\":7,\"product_name\":\"Item7\",\"product_category\":\"misc\"},{\"product_id\":8,\"product_name\":\"Item8\",\"product_category\":\"misc\"},{\"product_id\":9,\"product_name\":\"Item9\",\"product_category\":\"misc\"},{\"product_id\":10,\"product_name\":\"Item10\",\"product_category\":\"misc\"},{\"product_id\":11,\"product_name\":\"Item11\",\"product_category\":\"misc\"},{\"product_id\":12,\"product_name\":\"Item12\",\"product_category\":\"misc\"}],\"Orders\":[{\"product_id\":1,\"order_date\":\"2020-02-04\",\"unit\":255},{\"product_id\":5,\"order_date\":\"2020-01-22\",\"unit\":451},{\"product_id\":1,\"order_date\":\"2020-03-08\",\"unit\":57},{\"product_id\":9,\"order_date\":\"2020-01-18\",\"unit\":201},{\"product_id\":8,\"order_date\":\"2020-01-27\",\"unit\":150},{\"product_id\":2,\"order_date\":\"2020-02-01\",\"unit\":418},{\"product_id\":11,\"order_date\":\"2020-02-02\",\"unit\":472},{\"product_id\":2,\"order_date\":\"2020-03-28\",\"unit\":21},{\"product_id\":4,\"order_date\":\"2020-03-07\",\"unit\":418},{\"product_id\":12,\"order_date\":\"2020-01-17\",\"unit\":347},{\"product_id\":10,\"order_date\":\"2020-01-21\",\"unit\":267},{\"product_id\":5,\"order_date\":\"2020-03-05\",\"unit\":494}]}" }]
export const inputLabel = 'Object with Products and Orders lists (order_date as YYYY-MM-DD)'
export const complexity = 'O(p + o) with a hash join on product id. The visualization caps each table at 12 rows.'
export const reasoning = [
  'Only orders dated inside February 2020 count, so the date filter runs before any totals are formed.',
  'The units are grouped by product, and the threshold is applied to the group totals rather than to single orders.',
  'A product with two small February orders can still qualify, which is why the total is computed first.',
]

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`No SQL line contains "${key}".`)
  return index + 1
}
const P = key => {
  const index = python.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`No Python line contains "${key}".`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Products) || !Array.isArray(input.Orders)) throw new Error('Use an object with Products and Orders lists.')
  if (input.Products.length > 12 || input.Orders.length > 12) throw new Error('Keep each table to 12 rows.')
  for (const row of input.Orders) {
    if (!Number.isInteger(row.unit) || !/^\d{4}-\d{2}-\d{2}$/.test(row.order_date)) throw new Error('Each order needs an integer unit and a YYYY-MM-DD order_date.')
  }
  return { Products: input.Products, Orders: input.Orders }
}

export function buildTrace({ Products, Orders }) {
  const frames = []
  const push = (phase, sqlKey, pyKey, message, caption, columns, rows) => frames.push({
    phase, activeLine: L(sqlKey), pythonLine: P(pyKey), message,
    view: { caption, columns, rows: rows.map(row => ({ ...row })) },
  })
  push('load', 'FROM Products', 'def products_in_period', `Read ${Products.length} products.`, 'Products', ['product_id', 'product_name', 'product_category'], Products)
  const feb = Orders.filter(row => row.order_date >= '2020-02-01' && row.order_date < '2020-03-01')
  push('period', "WHERE o.order_date", 'feb = orders', `${feb.length} of ${Orders.length} orders fall in February 2020.`, 'February orders', ['product_id', 'order_date', 'unit'], feb)
  const totals = Products.map(product => {
    const unit = feb.filter(row => row.product_id === product.product_id).reduce((sum, row) => sum + row.unit, 0)
    return { product_id: product.product_id, product_name: product.product_name, unit }
  })
  push('group', 'GROUP BY p.product_id', 'totals = joined.groupby', 'Add the February units for each product.', 'Totals', ['product_name', 'unit'], totals)
  const kept = totals.filter(row => row.unit >= 100)
  push('having', 'HAVING SUM', 'kept = totals', `Keep ${kept.length} product(s) with at least 100 units.`, 'Above the threshold', ['product_name', 'unit'], kept)
  const result = [...kept].sort((a, b) => (a.product_name < b.product_name ? -1 : 1)).map(({ product_name, unit }) => ({ product_name, unit }))
  push('done', 'ORDER BY p.product_name', 'return kept', `Return ${result.length} rows sorted by name.`, 'Result', ['product_name', 'unit'], result)
  return { input: { Products, Orders }, result, frames }
}
