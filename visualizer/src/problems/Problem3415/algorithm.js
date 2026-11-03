// Knowledge-derived teaching model (not the official statement): keep products whose description contains
// at least three digits in a row. A longer run such as 9876 also contains a run of three. Verify official rules.

const SQL_LINES = [
  'SELECT product_id, product_name',
  'FROM Products',
  "WHERE description REGEXP '[0-9]{3}'",
  'ORDER BY product_id;',
]

const PY_LINES = [
  'def products_with_three_digits(products):',
  '    df = pd.DataFrame(products)',
  "    picked = df[df['description'].str.contains(r'[0-9]{3}', regex=True)]",
  "    picked = picked.sort_values('product_id')",
  "    return picked[['product_id', 'product_name']].to_dict('records')",
]

export const sql = SQL_LINES.join('\n')
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

export const phases = [
  { id: 'load', label: 'Load', description: 'Read every product row.' },
  { id: 'scan', label: 'Scan', description: 'Look for three digits in a row in each description.' },
  { id: 'order', label: 'Order', description: 'Sort the matches by product_id.' },
  { id: 'output', label: 'Result', description: 'Show the matching products.' },
]

function lineOf(lines, fragment) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}
const sqlAt = fragment => lineOf(SQL_LINES, fragment)
const pyAt = fragment => lineOf(PY_LINES, fragment)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.products)) throw new Error('Use an object with a products array.')
  if (input.products.length > 12) throw new Error('Use at most 12 products for the teaching view.')
  const ids = new Set()
  for (const row of input.products) {
    if (!Number.isInteger(row.product_id) || ids.has(row.product_id)) throw new Error('Each product_id must be a unique integer.')
    ids.add(row.product_id)
    if (typeof row.product_name !== 'string' || row.product_name.length < 1) throw new Error('product_name is text.')
    if (typeof row.description !== 'string' || row.description.length > 60 || !/^[A-Za-z0-9 ,.]*$/.test(row.description)) {
      throw new Error('description is up to 60 letters, digits, spaces, commas or periods.')
    }
  }
  return { products: input.products.map(row => ({ ...row })) }
}

export function buildTrace({ products }) {
  const frames = []
  const snap = rows => rows.map(row => ({ ...row }))
  frames.push({ phase: 'load', activeLine: sqlAt('FROM Products'), pythonLine: pyAt('DataFrame'), message: `Loaded ${products.length} products.`, rows: snap(products) })

  const kept = []
  for (const row of products) {
    const run = row.description.match(/[0-9]{3}/)
    if (run) kept.push(row)
    frames.push({
      phase: 'scan', activeLine: sqlAt('REGEXP'), pythonLine: pyAt('str.contains'),
      message: run ? `"${row.description}" has the run ${run[0]}: keep it.` : `"${row.description}" has no run of three digits.`,
      rows: snap(kept),
    })
  }

  const sorted = [...kept].sort((a, b) => a.product_id - b.product_id)
  frames.push({ phase: 'order', activeLine: sqlAt('ORDER BY'), pythonLine: pyAt('sort_values'), message: 'Sort by product_id.', rows: snap(sorted) })
  const result = sorted.map(({ product_id, product_name }) => ({ product_id, product_name }))
  frames.push({ phase: 'output', activeLine: sqlAt('SELECT product_id'), pythonLine: pyAt('return picked'), message: `Result has ${result.length} product${result.length === 1 ? '' : 's'}.`, rows: snap(result), result: true })
  return { input: { products }, result, frames }
}
