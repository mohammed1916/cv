// Knowledge-derived SQL walkthrough. The sample rows are invented for this visualization.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the store price rows.' },
  { id: 'group', label: 'Pivot', description: 'Fill one output row per product, one column per store.' },
  { id: 'done', label: 'Result', description: 'Return one row per product.' },
]

export const sql = `SELECT product_id,
  SUM(CASE WHEN store = 'store1' THEN price END) AS store1,
  SUM(CASE WHEN store = 'store2' THEN price END) AS store2,
  SUM(CASE WHEN store = 'store3' THEN price END) AS store3
FROM Products
GROUP BY product_id
ORDER BY product_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def pivot_prices(products):
    table = products.pivot_table(index="product_id", columns="store", values="price", aggfunc="sum")
    table = table.reindex(columns=["store1", "store2", "store3"])
    return table.reset_index().sort_values("product_id")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const COLUMNS = ['product_id', 'store1', 'store2', 'store3']
const STORES = ['store1', 'store2', 'store3']
const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 1 || input.length > 12) throw new Error('Use 1 to 12 Products rows.')
  return input.map(row => {
    if (!row || typeof row !== 'object' || !Number.isInteger(row.product_id) || !STORES.includes(row.store) || !Number.isInteger(row.price)) {
      throw new Error('Each row needs an integer product_id, a store of store1, store2 or store3, and an integer price.')
    }
    return { product_id: row.product_id, store: row.store, price: row.price }
  })
}

export function buildTrace(input) {
  const frames = [frame('load', 'FROM Products', 'def ', 'Load the store price rows.', ['product_id', 'store', 'price'], input)]
  const products = [...new Set(input.map(row => row.product_id))].sort((x, y) => x - y)
  const result = []
  for (const id of products) {
    const row = { product_id: id, store1: null, store2: null, store3: null }
    for (const entry of input.filter(item => item.product_id === id)) row[entry.store] = entry.price
    result.push(row)
    const shown = STORES.map(store => `${store} ${row[store] ?? 'NULL'}`).join(', ')
    frames.push(frame('group', "store = 'store1'", 'table = products', `Product ${id}: ${shown}.`, COLUMNS, result))
  }
  frames.push(frame('done', 'GROUP BY product_id', 'return', `Return ${result.length} product row${result.length === 1 ? '' : 's'}.`, COLUMNS, result))
  return { input, result, frames }
}
