// Knowledge-derived SQL lesson. The sample tables are invented for this visualization.
export const sql = `select p.name,
       coalesce(sum(i.rest), 0) as rest,
       coalesce(sum(i.paid), 0) as paid,
       coalesce(sum(i.canceled), 0) as canceled,
       coalesce(sum(i.refunded), 0) as refunded
from Product p
left join Invoice i on i.product_id = p.product_id
group by p.product_id, p.name
order by p.name`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def worth_by_product(product, invoice):
    merged = product.merge(invoice, on='product_id', how='left')
    cols = ['rest', 'paid', 'canceled', 'refunded']
    merged[cols] = merged[cols].fillna(0)
    totals = merged.groupby(['product_id', 'name'], as_index=False)[cols].sum()
    return totals.sort_values('name')[['name'] + cols]`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Product rows.' },
  { id: 'join', label: 'Join', description: 'Attach invoices; a product with none keeps a row of zeros.' },
  { id: 'group', label: 'Sum', description: 'Add the four amounts for each product.' },
  { id: 'order', label: 'Order', description: 'Sort by product name.' },
  { id: 'done', label: 'Result', description: 'Report every product, including those with no invoices.' },
]

const sqlLine = text => {
  const hit = code.find(c => c.text.includes(text))
  if (!hit) throw new Error(`No SQL line contains "${text}".`)
  return hit.line
}
const pyLine = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains "${text}".`)
  return index + 1
}
const frame = (phase, sqlText, pyText, rows, output, message) => ({
  phase, activeLine: sqlLine(sqlText), pythonLine: pyLine(pyText),
  rows: rows.map(row => ({ ...row })), output: output.map(row => ({ ...row })), message,
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Product and Invoice lists.')
  if (!Array.isArray(input.Product) || input.Product.length < 1 || input.Product.length > 8) throw new Error('Product is a list of 1 to 8 rows.')
  if (!Array.isArray(input.Invoice) || input.Invoice.length > 12) throw new Error('Invoice is a list of at most 12 rows.')
  for (const p of input.Product) {
    if (typeof p.product_id !== 'number' || typeof p.name !== 'string') throw new Error('Each product has product_id and name.')
  }
  for (const i of input.Invoice) {
    for (const key of ['invoice_id', 'product_id', 'rest', 'paid', 'canceled', 'refunded']) {
      if (!Number.isInteger(i[key]) || i[key] < 0) throw new Error('Each invoice has whole, non-negative rest, paid, canceled and refunded amounts.')
    }
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const products = input.Product.map(p => ({ ...p }))
  frames.push(frame('load', 'from Product p', 'def worth_by_product', products, [], `Read ${products.length} products.`))
  const joined = []
  for (const p of products) {
    const invoices = input.Invoice.filter(i => i.product_id === p.product_id)
    if (invoices.length === 0) {
      joined.push({ product_id: p.product_id, name: p.name, rest: 0, paid: 0, canceled: 0, refunded: 0 })
    }
    for (const i of invoices) {
      joined.push({ product_id: p.product_id, name: p.name, rest: i.rest, paid: i.paid, canceled: i.canceled, refunded: i.refunded })
    }
  }
  frames.push(frame('join', 'left join Invoice', "merged = product.merge", joined, [], 'Each product row meets its invoices; none means zeros.'))
  const sums = new Map()
  for (const row of joined) {
    const entry = sums.get(row.product_id) ?? { name: row.name, rest: 0, paid: 0, canceled: 0, refunded: 0 }
    entry.rest += row.rest
    entry.paid += row.paid
    entry.canceled += row.canceled
    entry.refunded += row.refunded
    sums.set(row.product_id, entry)
  }
  const totals = [...sums.values()]
  frames.push(frame('group', 'group by p.product_id', "totals = merged.groupby", totals, [], `Summed ${totals.length} products.`))
  const ordered = [...totals].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
  frames.push(frame('order', 'order by p.name', "sort_values('name')", ordered, [], 'Sort by product name.'))
  const result = ordered.map(t => ({ ...t }))
  frames.push(frame('done', 'select p.name', 'return totals', result, result, `Returned ${result.length} products.`))
  return { input, result, frames }
}
