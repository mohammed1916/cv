// Teaching rule: store columns are fixed (north, south, west); no dynamic SQL is used.
const STORES = ['north', 'south', 'west']

export const phases = [
  { id: 'columns', label: 'Columns', description: 'The store columns are fixed in the query.' },
  { id: 'product', label: 'Product', description: 'Start the output row for one product.' },
  { id: 'case', label: 'CASE', description: 'Keep the price when the store matches this column.' },
  { id: 'emit', label: 'Emit', description: 'The product row is complete.' },
  { id: 'done', label: 'Result', description: 'Every product has exactly one row.' },
]

export const sql = `SELECT product_id,
  MAX(CASE WHEN store = 'north' THEN price END) AS north,
  MAX(CASE WHEN store = 'south' THEN price END) AS south,
  MAX(CASE WHEN store = 'west' THEN price END) AS west
FROM Products
GROUP BY product_id
ORDER BY product_id;`

export const code = `pivot Products prices into the fixed store columns
for each product_id in ascending order
  start an output row holding product_id
  for each fixed store column north, south, west
    keep the price where the store matches, else NULL
  append the finished row
return the rows`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `STORES = ["north", "south", "west"]

def pivot_prices(rows):
    cells = {}
    for product_id, store, price in rows:
        cells[(product_id, store)] = price
    products = sorted({product_id for product_id, _, _ in rows})
    out = []
    for pid in products:
        row = {"product_id": pid}
        for store in STORES:
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

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a rows list.')
  const { rows } = input
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error('rows has 1 to 12 [product_id, store, price] triples.')
  const seen = new Set()
  return {
    rows: rows.map(row => {
      if (!Array.isArray(row) || row.length !== 3) throw new Error('Each row is [product_id, store, price].')
      const [productId, store, price] = row
      if (!Number.isInteger(productId) || productId < 1 || productId > 999) throw new Error('product_id is an integer from 1 to 999.')
      if (!STORES.includes(store)) throw new Error(`store must be one of ${STORES.join(', ')}.`)
      if (!Number.isInteger(price) || price < 0 || price > 1000) throw new Error('price is an integer from 0 to 1000.')
      const key = `${productId}|${store}`
      if (seen.has(key)) throw new Error('Each product has at most one price per store.')
      seen.add(key)
      return [productId, store, price]
    }),
  }
}

export function buildTrace({ rows }) {
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
    phase: 'columns', activeLine: L('pivot Products'), pythonLine: P('STORES = '),
    productId: null, store: null, snapshot: snapshotAt(0, -1),
    message: `Columns are fixed: ${STORES.join(', ')}.`,
  })
  products.forEach((id, index) => {
    frames.push({
      phase: 'product', activeLine: L('for each product_id'), pythonLine: P('for pid in products'),
      productId: id, store: null, snapshot: snapshotAt(index, -1),
      message: `Product ${id}: start its output row.`,
    })
    STORES.forEach((store, k) => {
      const price = cells.get(`${id}|${store}`)
      frames.push({
        phase: 'case', activeLine: L('for each fixed store'), pythonLine: P('row[store] = '),
        productId: id, store, snapshot: snapshotAt(index, k),
        message: `Product ${id}, ${store}: ${price === undefined ? 'no row, so NULL' : `keep ${price}`}.`,
      })
    })
    frames.push({
      phase: 'emit', activeLine: L('append the finished'), pythonLine: P('out.append(row)'),
      productId: id, store: null, snapshot: snapshotAt(index + 1, -1),
      message: `Product ${id} row is complete.`,
    })
  })
  const result = products.map(id => outputRow(id, STORES.length - 1))
  frames.push({
    phase: 'done', activeLine: L('return the rows'), pythonLine: P('return out'),
    productId: null, store: null, snapshot: snapshotAt(products.length, -1),
    message: `${products.length} product rows, one per product.`,
  })
  return { input: { rows }, result, frames }
}
