export const phases = [
  { id: 'load', label: 'Load', description: 'Take the table as it arrived.' },
  { id: 'mask', label: 'Mask', description: 'Ask each row whether its quantity is missing.' },
  { id: 'fill', label: 'Fill', description: 'Write 0 into the rows the mask selected.' },
  { id: 'done', label: 'Result', description: 'Return the same table with quantity complete.' },
]

const MAX_ROWS = 12

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with products.')
  const { products } = input
  if (!Array.isArray(products) || products.length < 1 || products.length > MAX_ROWS) throw new Error(`products has 1 to ${MAX_ROWS} rows.`)
  const rows = products.map(row => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Each row is an object with name, quantity and price.')
    const { name, quantity, price } = row
    if (typeof name !== 'string' || !name) throw new Error('Each row needs a non-empty name.')
    if (quantity !== null && !Number.isInteger(quantity)) throw new Error('quantity is an integer or null.')
    if (price !== null && !Number.isInteger(price)) throw new Error('price is an integer or null.')
    return { name, quantity, price }
  })
  return { products: rows }
}

export const code = `fill the missing quantities of a product table
  read the table
  build a mask: for each row, is quantity missing?
  for each row the mask selected, write 0 into quantity
  return the table`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd


def fill_missing_values(products):
    table = pd.DataFrame(products)
    missing = table['quantity'].isna()
    table.loc[missing, 'quantity'] = 0
    return table
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Pseudocode line missing: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.trim().split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line missing: ${text}`)
  return index + 1
}

export function buildTrace({ products }) {
  const before = products.map(row => ({ ...row }))
  const rows = products.map(row => ({ ...row }))
  const mask = []
  const filled = []
  const frames = []
  const emit = (phase, activeLine, pythonLine, active, message) => frames.push({
    phase, activeLine, pythonLine, active, message, rows: rows.map(row => ({ ...row })), mask: [...mask], filled: [...filled],
  })

  emit('load', L('read the table'), P('pd.DataFrame'), -1, `The table has ${rows.length} row${rows.length === 1 ? '' : 's'}. Only the quantity column will be examined.`)
  rows.forEach((row, i) => {
    mask.push(row.quantity === null)
    emit('mask', L('build a mask'), P('isna()'), i, row.quantity === null
      ? `${row.name} has no quantity, so the mask is True for row ${i}.`
      : `${row.name} has quantity ${row.quantity}, which is a real value${row.quantity === 0 ? ' even though it is 0' : ''}. The mask is False for row ${i}.`)
  })
  const selected = mask.flatMap((isMissing, i) => (isMissing ? [i] : []))
  if (!selected.length) emit('fill', L('write 0'), P('table.loc'), -1, 'The mask selected no rows, so nothing is written.')
  for (const i of selected) {
    rows[i].quantity = 0
    filled.push(i)
    emit('fill', L('write 0'), P('table.loc'), i, `Row ${i} (${rows[i].name}) was selected, so its quantity becomes 0.`)
  }
  emit('done', L('return the table'), P('return table'), -1, selected.length
    ? `Return the table: ${selected.length} quantit${selected.length === 1 ? 'y' : 'ies'} filled, every other cell unchanged.`
    : 'Return the table exactly as it arrived.')
  return { input: { products: before }, result: rows, frames }
}
