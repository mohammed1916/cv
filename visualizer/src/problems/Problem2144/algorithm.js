// LeetCode 2144: Minimum Cost of Buying Candies With Discount.
// Every third candy in the sorted-descending order is free, as long as it costs no more than the two bought
// before it. Sorting by cost descending means the most expensive candies are bought and the free ones are
// always the third, sixth, ... most expensive.

export function parseInput(text) {
  let cost
  try { cost = JSON.parse(text) } catch { throw new Error('Use a JSON array of positive costs, e.g. [1,2,3].') }
  if (!Array.isArray(cost) || cost.length < 1 || cost.length > 100 || cost.some(v => !Number.isInteger(v) || v < 1 || v > 100)) {
    throw new Error('Use 1 to 100 integer costs from 1 to 100.')
  }
  return { cost }
}

export const code = `function minimumCost(cost) {
  const sorted = [...cost].sort((a, b) => b - a)
  let total = 0
  for (let i = 0; i < sorted.length; i++) {
    if ((i + 1) % 3 !== 0) total += sorted[i]
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: minimum_cost
def minimum_cost(cost):
    ordered = sorted(cost, reverse=True)
    total = 0
    for i, value in enumerate(ordered):
        if (i + 1) % 3 != 0:
            total += value
    return total
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'sort', label: 'Sort', description: 'Order costs from highest to lowest.' },
  { id: 'pay', label: 'Pay', description: 'Two candies are paid for in each group of three.' },
  { id: 'free', label: 'Free', description: 'The third candy of each group is free.' },
  { id: 'done', label: 'Result', description: 'Total paid.' },
]

export function buildTrace({ cost }) {
  const frames = []
  const sorted = [...cost].sort((a, b) => b - a)
  let total = 0
  frames.push({ phase: 'sort', activeLine: L('const sorted'), pythonLine: P('ordered = sorted'), message: `Costs from highest to lowest: ${sorted.join(', ')}.`, sorted, i: -1, free: [], total })
  const free = []
  for (let i = 0; i < sorted.length; i++) {
    const isFree = (i + 1) % 3 === 0
    if (isFree) free.push(i)
    else total += sorted[i]
    frames.push({ phase: isFree ? 'free' : 'pay', activeLine: L('if ((i + 1) % 3'), pythonLine: P('if (i + 1) % 3'), message: isFree ? `Candy ${sorted[i]} is the third in its group: free.` : `Buy ${sorted[i]}; total ${total}.`, sorted, i, free: [...free], total })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), message: `Minimum cost: ${total}.`, sorted, i: -1, free: [...free], total })
  return { input: { cost }, result: total, frames }
}
