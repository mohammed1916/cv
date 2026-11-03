// Knowledge-derived teaching model of a SQL pattern filter. Not the official statement.
// Rule: the description contains SN-, four digits, a dash and two uppercase letters, with no letter or digit glued to either side.
const PATTERN = /(^|[^A-Za-z0-9])SN-\d{4}-[A-Z]{2}([^A-Za-z0-9]|$)/

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the products table.' },
  { id: 'scan', label: 'Scan', description: 'Search each description for a standalone serial.' },
  { id: 'order', label: 'Order', description: 'Return the kept products by product_id.' },
]

export const sql = `SELECT product_id, product_name
FROM products
WHERE description REGEXP '(^|[^A-Za-z0-9])SN-[0-9]{4}-[A-Z]{2}([^A-Za-z0-9]|$)'
ORDER BY product_id;`

export const python = `def find_valid_serials(products):
    pattern = r"(^|[^A-Za-z0-9])SN-[0-9]{4}-[A-Z]{2}([^A-Za-z0-9]|$)"
    keep = products[products["description"].str.contains(pattern, regex=True)]
    return keep[["product_id", "product_name"]].sort_values("product_id")`

const sqlLines = sql.split('\n')
const pyLines = python.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
function L(text) {
  const index = sqlLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No SQL line contains: ${text}`)
  return index + 1
}
function P(text) {
  const index = pyLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.products) || input.products.length > 12) throw new Error('Use an object with a products list of at most 12 rows.')
  const products = input.products.map(row => {
    if (!Number.isInteger(row?.product_id) || typeof row.product_name !== 'string' || typeof row.description !== 'string') throw new Error('Each product needs an integer product_id and text product_name and description.')
    return { product_id: row.product_id, product_name: row.product_name, description: row.description }
  })
  return { products }
}

const copy = list => list.map(row => ({ ...row }))

export function buildTrace(input) {
  const frames = []
  const kept = []
  frames.push({ phase: 'load', activeLine: L('FROM products'), pythonLine: P('def find_valid_serials'), message: `Loaded ${input.products.length} products.`, rows: copy(input.products) })
  for (const row of input.products) {
    const match = PATTERN.exec(row.description)
    if (match) kept.push({ product_id: row.product_id, product_name: row.product_name })
    const message = match
      ? `product ${row.product_id}: serial ${match[0].match(/SN-\d{4}-[A-Z]{2}/)[0]} qualifies.`
      : `product ${row.product_id}: no standalone serial matches.`
    frames.push({ phase: 'scan', activeLine: L('WHERE description'), pythonLine: P('keep ='), message, rows: copy(kept) })
  }
  const result = [...kept].sort((a, b) => a.product_id - b.product_id)
  frames.push({ phase: 'order', activeLine: L('ORDER BY'), pythonLine: P('return keep'), message: `Returned ${result.length} products.`, rows: copy(result) })
  return { input, result, frames }
}
