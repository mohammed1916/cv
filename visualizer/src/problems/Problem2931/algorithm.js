export function parseInput(text) {
  const rows = JSON.parse(text)
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 4) throw new Error('Use 1 to 4 shops.')
  const width = Array.isArray(rows[0]) ? rows[0].length : 0
  if (width < 1 || width > 4) throw new Error('Each shop lists 1 to 4 items.')
  for (const row of rows) {
    if (!Array.isArray(row) || row.length !== width) throw new Error('Every shop must list the same number of items.')
    if (row.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Prices are integers from 1 to 20.')
    if (row.some((v, i) => i > 0 && v > row[i - 1])) throw new Error('Each shop lists prices from highest to lowest.')
  }
  return rows
}

export function buildTrace(rows) {
  const prices = rows.flat().sort((a, b) => a - b)
  let total = 0
  const bought = []
  const frames = [{ phase: 'start', activeLine: L('gather every price'), day: 0, price: null, bought: [], total: 0, message: `Gather ${prices.length} prices and sort them ascending.` }]
  prices.forEach((price, index) => {
    const day = index + 1
    total += price * day
    bought.push(price)
    frames.push({ phase: 'buy', activeLine: L('buy the cheapest'), day, price, bought: [...bought], total, message: `Day ${day}: buy ${price} for ${price * day}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return total'), day: prices.length, price: null, bought: [...bought], total, message: `Maximum spending: ${total}.` })
  return { input: rows, result: total, frames }
}

export const code = `maximum spending after buying all items:
  gather every price from every shop
  sort the prices in ascending order
  for each price with its day number, starting at day 1 do
    buy the cheapest remaining item on that day
    add price times day to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_spending(values):
    prices = sorted(price for row in values for price in row)
    total = 0
    for day, price in enumerate(prices, start=1):
        total += price * day
    return total
`
