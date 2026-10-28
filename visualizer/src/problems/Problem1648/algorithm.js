const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with inventory and orders.')
  const { inventory, orders } = data
  if (!Array.isArray(inventory) || inventory.length < 1 || inventory.length > 4) throw new Error('inventory must have 1 to 4 colours.')
  if (inventory.some(v => !Number.isInteger(v) || v < 1 || v > 8)) throw new Error('Each colour has 1 to 8 balls.')
  const total = inventory.reduce((a, b) => a + b, 0)
  if (!Number.isInteger(orders) || orders < 1 || orders > Math.min(total, 20)) throw new Error('orders is an integer from 1 to the number of balls (at most 20).')
  return { inventory, orders }
}

export function buildTrace(input) {
  const counts = [...input.inventory]
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to zero'), counts: [...counts], index: -1, total, message: 'Each sale takes the colour with the most balls left and earns that count.' }]
  for (let sale = 0; sale < input.orders; sale++) {
    let best = 0
    for (let c = 1; c < counts.length; c++) if (counts[c] > counts[best]) best = c
    const value = counts[best]
    total = (total + value) % MOD
    counts[best] -= 1
    frames.push({ phase: 'sell', activeLine: L('sell one ball'), counts: [...counts], index: best, total, message: `Sale ${sale + 1}: sell a colour ${best} ball for ${value}. Total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), counts: [...counts], index: -1, total, message: `Maximum value modulo 1e9+7: ${total}.` })
  return { input, result: total, frames }
}

export const code = `maximum total value of the orders, modulo 1000000007:
  set total to zero
  set counts to the number of balls of each colour
  repeat once for each order
    find the colour with the most balls left
    add its count to total, modulo 1000000007
    sell one ball of that colour by reducing its count by one
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_sell_value(inventory, orders):
    MOD = 10 ** 9 + 7
    counts = list(inventory)
    total = 0
    for _ in range(orders):
        best = max(range(len(counts)), key=lambda c: counts[c])
        total = (total + counts[best]) % MOD
        counts[best] -= 1
    return total
`
