// Teaching rule: one output row per product, with one column per store that appears in the table.
// The store columns are sorted lexicographically, and a product with no price in a store gets NULL.

export const phases = [
  { id: 'columns', label: 'Columns', description: 'Each store in the table becomes a column, in lexicographic order.' },
  { id: 'product', label: 'Product', description: 'Start the output row for one product.' },
  { id: 'case', label: 'CASE', description: 'Keep the price when the store matches this column, otherwise NULL.' },
  { id: 'emit', label: 'Emit', description: 'The product row is complete.' },
  { id: 'done', label: 'Result', description: 'Every product has exactly one row.' },
]

// Written for the sample's three stores. A dynamic pivot builds this list from the table at run time.
export const sql = `SELECT product_id,
  MAX(CASE WHEN store = 'north' THEN price END) AS north,
  MAX(CASE WHEN store = 'south' THEN price END) AS south,
  MAX(CASE WHEN store = 'west' THEN price END) AS west
FROM Products
GROUP BY product_id
ORDER BY product_id;`

export const code = `function pivotProducts(rows) {
  const stores = [...new Set(rows.map(([, store]) => store))].sort()
  const cells = new Map(rows.map(([id, store, price]) => [\`\${id}|\${store}\`, price]))
  const products = [...new Set(rows.map(([id]) => id))].sort((a, b) => a - b)
  const out = []
  for (const id of products) {
    const row = { product_id: id }
    for (const store of stores) {
      row[store] = cells.get(\`\${id}|\${store}\`) ?? null
    }
    out.push(row)
  }
  return out
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def pivot_prices(rows):
    stores = sorted({store for _, store, _ in rows})
    cells = {}
    for product_id, store, price in rows:
        cells[(product_id, store)] = price
    products = sorted({product_id for product_id, _, _ in rows})
    out = []
    for pid in products:
        row = {"product_id": pid}
        for store in stores:
            row[store] = cells.get((pid, store))
        out.append(row)
    return out`

const PY_LINES = python.split('\n')
const lineOf = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code text: ${text}`)
  return index + 1
}
const L = text => lineOf(code.map(c => c.text), text)
const P = text => lineOf(PY_LINES, text)

const STORE = /^[a-z_]{1,20}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a rows list.')
  const { rows } = input
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error('rows has 1 to 12 [product_id, store, price] triples.')
  const seen = new Set()
  const stores = new Set()
  const parsed = rows.map(row => {
    if (!Array.isArray(row) || row.length !== 3) throw new Error('Each row is [product_id, store, price].')
    const [productId, store, price] = row
    if (!Number.isInteger(productId) || productId < 1 || productId > 999) throw new Error('product_id is an integer from 1 to 999.')
    if (typeof store !== 'string' || !STORE.test(store)) throw new Error('store is 1 to 20 lowercase letters or underscores.')
    if (!Number.isInteger(price) || price < 0 || price > 1000) throw new Error('price is an integer from 0 to 1000.')
    const key = `${productId}|${store}`
    if (seen.has(key)) throw new Error('Each product has at most one price per store.')
    seen.add(key)
    stores.add(store)
    return [productId, store, price]
  })
  if (stores.size > 30) throw new Error('The table has at most 30 stores.')
  return { rows: parsed }
}

export function buildTrace({ rows }) {
  const STORES = [...new Set(rows.map(([, store]) => store))].sort()
  const cells = new Map(rows.map(([id, store, price]) => [`${id}|${store}`, price]))
  const products = [...new Set(rows.map(([id]) => id))].sort((a, b) => a - b)
  // Output row for one product, with columns up to index `filledThrough` filled in and the rest NULL.
  const outputRow = (id, filledThrough) => ({
    product_id: id,
    ...Object.fromEntries(STORES.map((store, k) => [store, k <= filledThrough ? (cells.get(`${id}|${store}`) ?? null) : null])),
  })
  // Finished products before `index`, plus the product at `index` filled through column `k`.
  const snapshotAt = (index, k) => [
    ...products.slice(0, index).map(id => outputRow(id, STORES.length - 1)),
    ...(index < products.length ? [outputRow(products[index], k)] : []),
  ]
  const frames = []
  frames.push({
    phase: 'columns', activeLine: L('const stores'), pythonLine: P('stores = '),
    productId: null, store: null, snapshot: snapshotAt(0, -1),
    message: `Columns come from the table: ${STORES.join(', ')}.`,
  })
  products.forEach((id, index) => {
    frames.push({
      phase: 'product', activeLine: L('for (const id of products)'), pythonLine: P('for pid in products'),
      productId: id, store: null, snapshot: snapshotAt(index, -1),
      message: `Product ${id}: start its output row.`,
    })
    STORES.forEach((store, k) => {
      const price = cells.get(`${id}|${store}`)
      frames.push({
        phase: 'case', activeLine: L('for (const store of stores)'), pythonLine: P('row[store] = '),
        productId: id, store, snapshot: snapshotAt(index, k),
        message: `Product ${id}, ${store}: ${price === undefined ? 'no row, so NULL' : `keep ${price}`}.`,
      })
    })
    frames.push({
      phase: 'emit', activeLine: L('out.push(row)'), pythonLine: P('out.append(row)'),
      productId: id, store: null, snapshot: snapshotAt(index + 1, -1),
      message: `Product ${id} row is complete.`,
    })
  })
  const result = products.map(id => outputRow(id, STORES.length - 1))
  frames.push({
    phase: 'done', activeLine: L('return out'), pythonLine: P('return out'),
    productId: null, store: null, snapshot: snapshotAt(products.length, -1),
    message: `${products.length} product rows, one per product.`,
  })
  return { input: { rows }, result, frames }
}
