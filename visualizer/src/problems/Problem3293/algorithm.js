// Teaching model written for this visualizer. Prices are whole units; final prices keep their exact value.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read products and category discounts.' },
  { id: 'match', label: 'Match', description: 'Find the discount for the product category.' },
  { id: 'default', label: 'Default', description: 'No discount row exists, so the discount is 0.' },
  { id: 'price', label: 'Price', description: 'Compute the discounted price exactly, with no rounding.' },
  { id: 'output', label: 'Result', description: 'Return one final price per product.' },
]

export const code = `SELECT p.product_id,
  (p.price * (100 - COALESCE(d.discount, 0))) / 100 AS final_price
FROM Products p
LEFT JOIN Discounts d ON d.category = p.category
ORDER BY p.product_id`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def final_prices(products, discounts):
    m = products.merge(discounts, on='category', how='left')
    m['discount'] = m['discount'].fillna(0).astype(int)
    m['final_price'] = m.price * (100 - m.discount) / 100
    return m[['product_id', 'final_price']].sort_values('product_id')
`

const lookupCode = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`No SQL line contains: ${text}`)
  return index + 1
}
const lookupPython = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Products) || !Array.isArray(input.Discounts)) throw new Error('Use an object with Products and Discounts lists.')
  if (input.Products.length > 8 || input.Discounts.length > 6) throw new Error('Use at most 8 products and 6 discounts.')
  for (const p of input.Products) {
    if (!Number.isInteger(p.product_id) || typeof p.category !== 'string' || !Number.isInteger(p.price) || p.price < 0) {
      throw new Error('Each product needs an integer product_id, a category and a price in whole units.')
    }
  }
  const seen = new Set()
  for (const d of input.Discounts) {
    if (typeof d.category !== 'string' || !Number.isInteger(d.discount) || d.discount < 0 || d.discount > 100) throw new Error('Each discount needs a category and a whole discount from 0 to 100.')
    if (seen.has(d.category)) throw new Error('Each category has at most one discount.')
    seen.add(d.category)
  }
  return input
}

export function buildTrace(input) {
  const discountOf = new Map(input.Discounts.map(d => [d.category, d.discount]))
  const products = [...input.Products].sort((a, b) => a.product_id - b.product_id)
  const out = []
  const rows = () => out.map(r => ({ ...r }))
  const joined = products.map(p => ({ product_id: p.product_id, category: p.category, discount: discountOf.has(p.category) ? discountOf.get(p.category) : null, final: null }))
  const frames = []
  const push = (phase, sqlText, pyText, message) => frames.push({
    phase, activeLine: lookupCode(sqlText), pythonLine: lookupPython(pyText), message, rows: rows(), joined: joined.map(r => ({ ...r })),
  })
  push('load', 'FROM Products p', 'products.merge', `Load ${products.length} products and ${input.Discounts.length} category discounts.`)
  for (const p of products) {
    const found = discountOf.has(p.category)
    push('match', 'LEFT JOIN Discounts', 'how=', `Look up the ${p.category} discount for product ${p.product_id}.`)
    const discount = found ? discountOf.get(p.category) : 0
    if (!found) push('default', 'COALESCE', 'fillna(0)', `Product ${p.product_id} has no ${p.category} discount, so the discount is 0.`)
    const final = (p.price * (100 - discount)) / 100
    out.push({ product_id: p.product_id, final_price: final })
    joined.find(r => r.product_id === p.product_id).final = final
    push('price', 'AS final_price', "m['final_price'] =", `Price ${p.price} at ${discount}% off is ${final.toFixed(2)}, with no rounding.`)
  }
  const result = rows()
  push('output', 'ORDER BY p.product_id', 'return m', `Return ${result.length} product row${result.length === 1 ? '' : 's'}.`)
  return { input, result, frames }
}
