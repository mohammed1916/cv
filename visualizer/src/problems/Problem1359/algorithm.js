const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const n = data?.n
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n must be an integer from 1 to 8.')
  return { n }
}

export const code = `count valid orders(n)
  set ways to 1 for zero orders
  for k from 1 to n
    insert pickup k into any of the 2k-1 gaps
    insert delivery k after its pickup: k(2k-1) placements in total
    multiply ways by k(2k-1) and keep it modulo 1000000007
  return ways`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Adding order k to a valid sequence of k-1 orders: the pickup has 2k-1 gaps, and over all
// of them the delivery has k(2k-1) placements after its pickup.
export function buildTrace({ n }) {
  const values = Array(n + 1).fill('–')
  let ways = 1
  values[0] = 1
  const frames = [{ phase: 'start', k: 0, dp: [...values], activeLine: L('set ways to 1'), message: 'With no orders there is exactly one (empty) valid sequence.' }]
  for (let k = 1; k <= n; k++) {
    ways = (ways * k * (2 * k - 1)) % MOD
    values[k] = ways
    frames.push({ phase: 'order', k, dp: [...values], activeLine: L('multiply ways by'), message: `Order ${k}: the pickup has ${2 * k - 1} gaps and the delivery has ${k * (2 * k - 1)} placements in total, so the count becomes ${ways}.` })
  }
  frames.push({ phase: 'done', k: n, dp: [...values], activeLine: L('return ways'), result: ways, message: `There are ${ways} valid pickup and delivery orders for ${n} orders.` })
  return { input: { n }, result: ways, frames }
}

export const python = `def count_orders(n):
    MOD = 1000000007
    ways = 1
    for k in range(1, n + 1):
        ways = ways * k * (2 * k - 1) % MOD
    return ways
`
