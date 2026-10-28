export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with basket1 and basket2.')
  const { basket1, basket2 } = data
  if (!Array.isArray(basket1) || !Array.isArray(basket2) || basket1.length !== basket2.length || basket1.length < 1 || basket1.length > 4) throw new Error('basket1 and basket2 must be equal-length arrays of 1 to 4 entries.')
  if ([...basket1, ...basket2].some(v => !Number.isInteger(v) || v < 1 || v > 5)) throw new Error('Fruit costs are integers from 1 to 5.')
  return { basket1, basket2 }
}

export function buildTrace(input) {
  const { basket1, basket2 } = input
  const diff = new Map()
  for (const v of basket1) diff.set(v, (diff.get(v) || 0) + 1)
  for (const v of basket2) diff.set(v, (diff.get(v) || 0) - 1)
  const frames = [{ phase: 'start', activeLine: L('count each fruit cost'), extra: [], cost: 0, message: 'Compare how often each cost appears in the two baskets.' }]
  for (const [v, d] of diff) {
    if (d % 2 !== 0) {
      frames.push({ phase: 'done', activeLine: L('return minus one'), extra: [], cost: -1, message: `Cost ${v} appears an odd number of times more in one basket, so the baskets cannot match.` })
      return { input, result: -1, frames }
    }
  }
  const extra = []
  for (const [v, d] of diff) {
    if (d > 0) for (let k = 0; k < d / 2; k++) extra.push(v)
    if (d < 0) for (let k = 0; k < -d / 2; k++) extra.push(v)
  }
  const minValue = Math.min(...basket1, ...basket2)
  const sorted = [...extra].sort((a, b) => a - b)
  let cost = 0
  for (let i = 0; i < sorted.length / 2; i++) {
    const step = Math.min(sorted[i], 2 * minValue)
    cost += step
    frames.push({ phase: 'swap', activeLine: L('add the cheaper route'), extra: [...sorted], index: i, cost, message: `Swap ${sorted[i]} directly or via ${minValue} twice, whichever is cheaper: ${step}. Total ${cost}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return cost'), extra: [...sorted], cost, message: `Minimum cost: ${cost}.` })
  return { input, result: cost, frames }
}

export const code = `minimum cost to make the two baskets equal, or minus one:
  count each fruit cost across both baskets, with basket1 counted plus and basket2 minus
  if any count is odd then return minus one
  collect each surplus fruit cost, half its count, from both baskets
  set minimum to the cheapest fruit in either basket
  sort the collected costs
  set cost to zero
  for each of the smaller half of the sorted costs
    add the cheaper route: the cost itself or twice minimum, whichever is less
  return cost`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_fruit_cost(basket1, basket2):
    diff = {}
    for v in basket1:
        diff[v] = diff.get(v, 0) + 1
    for v in basket2:
        diff[v] = diff.get(v, 0) - 1
    if any(d % 2 for d in diff.values()):
        return -1
    extra = []
    for v, d in diff.items():
        if d > 0:
            extra += [v] * (d // 2)
        elif d < 0:
            extra += [v] * ((-d) // 2)
    lowest = min(min(basket1), min(basket2))
    extra.sort()
    cost = 0
    for x in extra[:len(extra) // 2]:
        cost += min(x, 2 * lowest)
    return cost
`
