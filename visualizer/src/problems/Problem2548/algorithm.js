const CODE = [
  'maximum price to fill a bag of exactly capacity, fractions allowed',
  'if the total weight of all items is less than capacity, return -1',
  'sort items by price per unit weight, highest first',
  'remaining is capacity and total is 0',
  'for each item with price p and weight w in that order',
  '  take = the smaller of w and remaining',
  '  total increases by p times take divided by w',
  '  remaining decreases by take',
  '  if remaining is 0, stop',
  'return total',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))

const PY = [
  'def max_price_to_fill(items, capacity):',
  '    if sum(weight for _, weight in items) < capacity:',
  '        return -1',
  '    ranked = sorted(items, key=lambda item: item[0] / item[1], reverse=True)',
  '    remaining = capacity',
  '    total = 0.0',
  '    for price, weight in ranked:',
  '        take = min(weight, remaining)',
  '        total += price * take / weight',
  '        remaining -= take',
  '        if remaining == 0:',
  '            break',
  '    return total',
]
export const python = `${PY.join('\n')}\n`

const L = key => {
  const found = code.findIndex(c => c.text.includes(key))
  if (found < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return found + 1
}
const P = key => {
  const found = PY.findIndex(line => line.includes(key))
  if (found < 0) throw new Error(`Missing python line: ${key}`)
  return found + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with items and capacity.')
  const { items, capacity } = input
  if (!Array.isArray(items) || items.length < 1 || items.length > 8) throw new Error('items has 1 to 8 [price, weight] pairs.')
  for (const item of items) {
    if (!Array.isArray(item) || item.length !== 2) throw new Error('Each item is [price, weight].')
    const [price, weight] = item
    if (!Number.isInteger(price) || price < 1 || price > 100) throw new Error('Each price is a whole number from 1 to 100.')
    if (!Number.isInteger(weight) || weight < 1 || weight > 50) throw new Error('Each weight is a whole number from 1 to 50.')
  }
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 200) throw new Error('capacity is a whole number from 1 to 200.')
  return { items, capacity }
}

export function buildTrace({ items, capacity }) {
  const frames = []
  const totalWeight = items.reduce((sum, [, w]) => sum + w, 0)
  const ranked = items
    .map(([price, weight], index) => ({ index, price, weight, ratio: price / weight, take: 0 }))
    .sort((a, b) => b.ratio - a.ratio)
  let remaining = capacity
  let total = 0
  const snapshot = () => ranked.map(row => ({ ...row }))
  const F = (phase, codeKey, pyKey, message, state = {}) => frames.push({
    phase, activeLine: L(codeKey), pythonLine: P(pyKey), message, remaining, total, rows: snapshot(), current: -1, capacity, ...state,
  })
  F('check', 'if the total weight of all items', 'if sum(weight', `Total weight is ${totalWeight} and the bag holds ${capacity}.`)
  if (totalWeight < capacity) {
    F('done', 'return -1', 'return -1', 'The items cannot fill the bag, so the answer is -1.', { result: -1 })
    return { input: { items, capacity }, result: -1, frames }
  }
  F('sort', 'sort items by price per unit', 'ranked = sorted', 'Rank the items by price per unit of weight, best first.')
  F('setup', 'remaining is capacity', 'remaining = capacity', `Start with ${capacity} units of room and total 0.`)
  for (let position = 0; position < ranked.length; position++) {
    const row = ranked[position]
    const take = Math.min(row.weight, remaining)
    row.take = take
    total += (row.price * take) / row.weight
    remaining -= take
    F('take', 'for each item with price p', 'for price, weight in ranked', `Take ${take} of item ${row.index} (price ${row.price}, weight ${row.weight}).`, { current: position })
    F('take', 'if remaining is 0, stop', 'if remaining == 0', remaining === 0
      ? `The bag is full at total ${total}.`
      : `${remaining} units of room are left.`, { current: position })
    if (remaining === 0) break
  }
  F('done', 'return total', 'return total', `Maximum price: ${total}.`, { result: total })
  return { input: { items, capacity }, result: total, frames }
}
