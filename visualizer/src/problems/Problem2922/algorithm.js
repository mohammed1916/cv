// Teaching rule: a seller qualifies when the orders they received cover at least two distinct item brands.
const BRAND = /^[A-Za-z]{1,10}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with items and orders.')
  const { items, orders } = input
  if (!Array.isArray(items) || items.length < 1 || items.length > 8) throw new Error('items has 1 to 8 rows.')
  if (!Array.isArray(orders) || orders.length < 1 || orders.length > 10) throw new Error('orders has 1 to 10 rows.')
  const itemIds = new Set()
  for (const row of items) {
    if (!row || !Number.isInteger(row.item_id) || row.item_id < 1) throw new Error('Each item needs a positive integer item_id.')
    if (typeof row.item_brand !== 'string' || !BRAND.test(row.item_brand)) throw new Error('Each item_brand is 1 to 10 letters.')
    if (itemIds.has(row.item_id)) throw new Error(`item_id ${row.item_id} appears twice.`)
    itemIds.add(row.item_id)
  }
  for (const row of orders) {
    if (!row || !Number.isInteger(row.order_id) || row.order_id < 1) throw new Error('Each order needs a positive integer order_id.')
    if (!Number.isInteger(row.seller_id) || row.seller_id < 1) throw new Error('Each seller_id is a positive integer.')
    if (!itemIds.has(row.item_id)) throw new Error(`order ${row.order_id} refers to an unknown item.`)
  }
  return {
    items: items.map(({ item_id, item_brand }) => ({ item_id, item_brand })),
    orders: orders.map(({ order_id, item_id, seller_id }) => ({ order_id, item_id, seller_id })),
  }
}

function snapshot(brandsBySeller, verdicts) {
  return [...brandsBySeller.keys()].sort((a, b) => a - b).map(seller => ({
    seller_id: seller,
    brands: [...brandsBySeller.get(seller)].sort(),
    qualifies: verdicts.has(seller) ? verdicts.get(seller) : null,
  }))
}

export function buildTrace({ items, orders }) {
  const brandOf = new Map(items.map(row => [row.item_id, row.item_brand]))
  const brandsBySeller = new Map()
  const verdicts = new Map()
  const result = []
  const frames = []
  frames.push({
    pythonLine: L('brand_of = '), phase: 'items', activeLine: L('index each item'), order: null,
    rows: snapshot(brandsBySeller, verdicts),
    message: `Index ${items.length} items to their brands.`,
  })
  for (const order of orders) {
    const brand = brandOf.get(order.item_id)
    if (!brandsBySeller.has(order.seller_id)) brandsBySeller.set(order.seller_id, new Set())
    brandsBySeller.get(order.seller_id).add(brand)
    frames.push({
      pythonLine: L('brands_by_seller.setdefault'), phase: 'collect', activeLine: L('for each order, add'),
      order: order.order_id, rows: snapshot(brandsBySeller, verdicts),
      message: `Order ${order.order_id}: seller ${order.seller_id} sold brand ${brand}; now ${brandsBySeller.get(order.seller_id).size} brand${brandsBySeller.get(order.seller_id).size === 1 ? '' : 's'}.`,
    })
  }
  for (const seller of [...brandsBySeller.keys()].sort((a, b) => a - b)) {
    const count = brandsBySeller.get(seller).size
    const qualifies = count >= 2
    verdicts.set(seller, qualifies)
    if (qualifies) result.push(seller)
    frames.push({
      pythonLine: L('if len(brands) >= 2'), phase: 'decide', activeLine: L('keep the seller when'), order: null,
      rows: snapshot(brandsBySeller, verdicts),
      message: qualifies
        ? `Seller ${seller} has ${count} brands, so it is kept.`
        : `Seller ${seller} has ${count} brand, so it is dropped.`,
    })
  }
  frames.push({
    pythonLine: L('return sorted'), phase: 'done', activeLine: L('return the kept seller ids'), order: null,
    rows: snapshot(brandsBySeller, verdicts),
    message: result.length ? `Sellers kept: ${result.join(', ')}.` : 'No seller reaches two brands.',
  })
  return { input: { items, orders }, result, frames }
}

export const code = `seller brand diversity
  index each item to its brand
  for each order, add the item's brand to its seller's set of brands
  for each seller in ascending seller_id order
    keep the seller when its set has at least two brands
  return the kept seller ids`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const sql = `SELECT o.seller_id
FROM Orders o
JOIN Items i ON i.item_id = o.item_id
GROUP BY o.seller_id
HAVING COUNT(DISTINCT i.item_brand) >= 2
ORDER BY o.seller_id;`

export const python = `def seller_brand_diversity(items, orders):
    brand_of = {row.item_id: row.item_brand for row in items}
    brands_by_seller = {}
    for order in orders:
        brands_by_seller.setdefault(order.seller_id, set()).add(brand_of[order.item_id])
    return sorted(s for s, brands in brands_by_seller.items() if len(brands) >= 2)`

const L = text => {
  const found = code.findIndex(line => line.text.includes(text)) + 1
  if (found > 0) return found
  const pythonFound = python.split('\n').findIndex(line => line.includes(text)) + 1
  if (pythonFound > 0) return pythonFound
  throw new Error(`Missing trace text: ${text}`)
}
