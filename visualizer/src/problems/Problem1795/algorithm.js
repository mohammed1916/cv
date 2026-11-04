// SQL walkthrough. The sample rows are invented for this visualization.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the wide product rows.' },
  { id: 'store', label: 'Unpivot', description: 'Take one store column at a time and keep its non-NULL prices.' },
  { id: 'done', label: 'Result', description: 'Return the long-form rows in order.' },
]

export const sql = `SELECT * FROM (
  SELECT product_id, 'store1' AS store, store1 AS price
  FROM Products
  WHERE store1 IS NOT NULL
  UNION ALL
  SELECT product_id, 'store2', store2
  FROM Products
  WHERE store2 IS NOT NULL
  UNION ALL
  SELECT product_id, 'store3', store3
  FROM Products
  WHERE store3 IS NOT NULL
) u
ORDER BY product_id, store`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def unpivot_prices(products):
    parts = []
    for store in ["store1", "store2", "store3"]:
        part = products[["product_id", store]].rename(columns={store: "price"})
        part = part.assign(store=store)
        parts.append(part[part["price"].notna()])
    result = pd.concat(parts)[["product_id", "store", "price"]]
    return result.sort_values(["product_id", "store"]).reset_index(drop=True)`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const COLUMNS = ['product_id', 'store', 'price']
const STORES = ['store1', 'store2', 'store3']
const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 1 || input.length > 12) throw new Error('Use 1 to 12 Products rows.')
  return input.map(row => {
    if (!row || !Number.isInteger(row.product_id)) throw new Error('Each row needs an integer product_id.')
    const out = { product_id: row.product_id }
    for (const store of STORES) {
      if (!(store in row) || (row[store] !== null && !Number.isInteger(row[store]))) throw new Error(`${store} must be an integer or null.`)
      out[store] = row[store]
    }
    return out
  })
}

export function buildTrace(input) {
  const frames = [frame('load', 'FROM Products', 'def ', 'Load the wide product rows.', ['product_id', ...STORES], input)]
  const out = []
  for (const store of STORES) {
    const keep = input.filter(row => row[store] !== null)
    for (const row of keep) out.push({ product_id: row.product_id, store, price: row[store] })
    const sqlKey = `WHERE ${store} IS NOT NULL`
    frames.push(frame('store', sqlKey, `part = products[`, `${store}: ${keep.length} non-NULL price${keep.length === 1 ? '' : 's'} kept, missing ones skipped.`, COLUMNS, out))
  }
  const result = [...out].sort((a, b) => a.product_id - b.product_id || (a.store < b.store ? -1 : a.store > b.store ? 1 : 0))
  frames.push(frame('done', 'ORDER BY product_id', 'return', `Return ${result.length} row${result.length === 1 ? '' : 's'}.`, COLUMNS, result))
  return { input, result, frames }
}
