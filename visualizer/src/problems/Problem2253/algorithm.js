// SQL walkthrough. The sample tables are invented for this visualization.
// The generated query repeats one SELECT per discovered store column.
export const sql = `WITH unpivoted AS (
SELECT product_id, 'store1' AS store, store1 AS price FROM Products
UNION ALL
SELECT product_id, 'store2' AS store, store2 AS price FROM Products
UNION ALL
SELECT product_id, 'store3' AS store, store3 AS price FROM Products
)
SELECT product_id, store, price
FROM unpivoted
WHERE price IS NOT NULL
ORDER BY product_id, store`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def unpivot_prices(products):
    stores = [c for c in products.columns if c != "product_id"]
    long = products.melt(id_vars="product_id", value_vars=stores, var_name="store", value_name="price")
    long = long.dropna(subset=["price"])
    return long.sort_values(["product_id", "store"])`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read one row per product.' },
  { id: 'discover', label: 'Columns', description: 'Find the store columns in the table.' },
  { id: 'unpivot', label: 'Unpivot', description: 'Turn each store column into rows.' },
  { id: 'done', label: 'Result', description: 'Sort the output by product and store.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const rows = input && Array.isArray(input.Products) ? input.Products : null
  if (!rows || rows.length < 1 || rows.length > 30) throw new Error('Products needs 1 to 30 rows.')
  for (const row of rows) {
    if (!row || typeof row !== 'object' || !Number.isInteger(row.product_id)) throw new Error('Each row needs an integer product_id.')
    for (const [key, value] of Object.entries(row)) {
      if (key !== 'product_id' && value !== null && typeof value !== 'number') throw new Error(`${key} must be a number or null.`)
    }
  }
  return { Products: rows.map(row => ({ ...row })) }
}

export function buildTrace(input) {
  const rows = input.Products
  const stores = []
  for (const row of rows) {
    for (const key of Object.keys(row)) if (key !== 'product_id' && !stores.includes(key)) stores.push(key)
  }
  const columns = ['product_id', ...stores]
  const longColumns = ['product_id', 'store', 'price']
  const frames = [frame('load', 'FROM Products', 'def ', 'Read one row per product. Each store is a column.', columns, rows)]
  frames.push(frame('discover', 'WITH unpivoted', 'stores = ', `Found store columns: ${stores.join(', ')}.`, columns, rows))
  const long = []
  for (const store of stores) {
    for (const row of rows) {
      if (row[store] !== null && row[store] !== undefined) long.push({ product_id: row.product_id, store, price: row[store] })
    }
    frames.push(frame('unpivot', 'UNION ALL', 'long = products.melt', `Add the ${store} prices as rows, skipping NULL.`, longColumns, long))
  }
  const result = [...long].sort((a, b) => a.product_id - b.product_id || (a.store < b.store ? -1 : a.store > b.store ? 1 : 0))
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} rows sorted by product and store.`, longColumns, result))
  return { input, result, frames }
}
