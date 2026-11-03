// Knowledge-derived draft: the rule is the author's own reading of the table task, not copied from an official statement.
// Rule: for each store with at least two products, compare the stock on products priced above the store's average
// price with the stock on products priced below it. The store is imbalanced when the above-average stock is smaller.
const numbered = list => list.map((text, index) => ({ line: index + 1, text }))
const COLS = ['store_id', 'store_name', 'high_stock', 'low_stock']
const STOCK_COLS = ['product_id', 'price', 'quantity', 'side']

export const code = numbered([
  'WITH stock AS (',
  '  SELECT i.store_id, i.product_id, i.price, i.quantity,',
  '    AVG(i.price) OVER (PARTITION BY i.store_id) AS avg_price,',
  '    COUNT(*) OVER (PARTITION BY i.store_id) AS items',
  '  FROM inventory i',
  '), split AS (',
  '  SELECT store_id, MAX(items) AS items,',
  '    SUM(CASE WHEN price > avg_price THEN quantity ELSE 0 END) AS high_stock,',
  '    SUM(CASE WHEN price < avg_price THEN quantity ELSE 0 END) AS low_stock',
  '  FROM stock GROUP BY store_id',
  ')',
  'SELECT st.store_id, st.store_name, sp.high_stock, sp.low_stock',
  'FROM split sp JOIN stores st USING (store_id)',
  'WHERE sp.items >= 2 AND sp.high_stock < sp.low_stock',
  'ORDER BY st.store_name',
])

export const python = `import pandas as pd
def imbalanced_stores(stores, inventory):
    inv = inventory.copy()
    inv["avg_price"] = inv.groupby("store_id").price.transform("mean")
    counts = inv.groupby("store_id").size().rename("items")
    high = inv[inv.price > inv.avg_price].groupby("store_id").quantity.sum().rename("high_stock")
    low = inv[inv.price < inv.avg_price].groupby("store_id").quantity.sum().rename("low_stock")
    out = pd.concat([counts, high, low], axis=1).fillna(0).astype(int).reset_index()
    out = out[(out.items >= 2) & (out.high_stock < out.low_stock)].merge(stores, on="store_id")
    return out.sort_values("store_name")[["store_id", "store_name", "high_stock", "low_stock"]]
`

const pyLines = numbered(python.split('\n'))

export const SAMPLE_TEXT = '{"stores":[{"store_id":1,"store_name":"Alpha"},{"store_id":2,"store_name":"Beta"},{"store_id":3,"store_name":"Gamma"},{"store_id":4,"store_name":"Delta"}],"inventory":[{"store_id":1,"product_id":1,"price":10,"quantity":5},{"store_id":1,"product_id":2,"price":30,"quantity":1},{"store_id":1,"product_id":3,"price":20,"quantity":2},{"store_id":2,"product_id":4,"price":10,"quantity":1},{"store_id":2,"product_id":5,"price":30,"quantity":9},{"store_id":3,"product_id":6,"price":15,"quantity":4},{"store_id":4,"product_id":7,"price":5,"quantity":1},{"store_id":4,"product_id":8,"price":50,"quantity":2},{"store_id":4,"product_id":9,"price":5,"quantity":4}]}'

function lineOf(list, fragment, label) {
  const hit = list.find(row => row.text.includes(fragment))
  if (!hit) throw new Error(`${label} line missing: ${fragment}`)
  return hit.line
}

function frame(phase, sql, py, message, columns, rows) {
  return { phase, activeLine: lineOf(code, sql, 'SQL'), pythonLine: lineOf(pyLines, py, 'Python'), message, columns, rows: rows.map(row => ({ ...row })) }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.stores) || !Array.isArray(input.inventory)) throw new Error('Use stores and inventory lists.')
  for (const row of input.inventory) {
    if (!(row.price > 0) || !(row.quantity >= 0)) throw new Error('Each product needs a positive price and a non-negative quantity.')
  }
  return input
}

export function buildTrace(input) {
  const { stores, inventory } = input
  const frames = [frame('load', 'WITH stock AS (', 'def imbalanced_stores', `Load ${inventory.length} inventory rows.`, ['store_id', 'product_id', 'price', 'quantity'], inventory)]
  const found = []
  for (const store of stores) {
    const items = inventory.filter(r => r.store_id === store.store_id)
    const avg = items.length ? items.reduce((acc, r) => acc + r.price, 0) / items.length : 0
    const rows = items.map(r => ({ product_id: r.product_id, price: r.price, quantity: r.quantity, side: r.price > avg ? 'above' : r.price < avg ? 'below' : 'level' }))
    frames.push(frame('average', 'AS avg_price', 'transform("mean")', `${store.store_name}: average price ${avg}.`, STOCK_COLS, rows))
    const high = items.filter(r => r.price > avg).reduce((acc, r) => acc + r.quantity, 0)
    const low = items.filter(r => r.price < avg).reduce((acc, r) => acc + r.quantity, 0)
    frames.push(frame('split', 'SUM(CASE WHEN price > avg_price', 'inv.price > inv.avg_price', `${store.store_name}: above-average stock ${high}, below-average stock ${low}.`, STOCK_COLS, rows))
    if (items.length >= 2 && high < low) {
      found.push({ store_id: store.store_id, store_name: store.store_name, high_stock: high, low_stock: low })
      frames.push(frame('keep', 'WHERE sp.items >= 2 AND sp.high_stock < sp.low_stock', 'out.items >= 2', `${store.store_name} is imbalanced.`, COLS, found))
    } else {
      const reason = items.length < 2 ? 'has fewer than two products' : 'is balanced'
      frames.push(frame('skip', 'WHERE sp.items >= 2', 'out.items >= 2', `${store.store_name} ${reason}.`, COLS, found))
    }
  }
  const rows = [...found].sort((a, b) => a.store_name.localeCompare(b.store_name))
  frames.push(frame('order', 'ORDER BY st.store_name', 'sort_values("store_name")', 'Sort by store name.', COLS, rows))
  frames.push(frame('done', 'SELECT st.store_id, st.store_name', 'return out.sort_values("store_name")', `Result has ${rows.length} row(s).`, COLS, rows))
  return { input: { stores, inventory }, result: rows, frames }
}
