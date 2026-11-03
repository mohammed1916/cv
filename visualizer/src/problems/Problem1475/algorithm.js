export const phases = [
  { id: 'start', label: 'Start', description: 'Nothing is waiting; every item has its full price.' },
  { id: 'inspect', label: 'Read price', description: 'Read the next item and compare it with the waiting items.' },
  { id: 'discount', label: 'Discount', description: 'A waiting item receives the current price as its discount.' },
  { id: 'wait', label: 'Wait', description: 'The current item waits for a later price that is no higher.' },
  { id: 'done', label: 'Complete', description: 'Items still waiting keep their full price.' },
]

export function parseInput(text) {
  const prices = JSON.parse(text)
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 200) throw new Error('Enter a JSON array of 1 to 200 prices.')
  if (!prices.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Every price must be an integer from 1 to 1000.')
  return prices
}

export const code = `final prices (prices):
  waiting = empty stack of indices
  result = copy of prices
  for i from 0 to n - 1:
    while waiting is not empty and prices[top of waiting] >= prices[i]:
      j = pop waiting
      result[j] = prices[j] - prices[i]
    push i onto waiting
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def final_prices(prices):
    waiting = []
    result = prices[:]
    for i, price in enumerate(prices):
        while waiting and prices[waiting[-1]] >= price:
            j = waiting.pop()
            result[j] = prices[j] - price
        waiting.append(i)
    return result
`

export function buildTrace(prices) {
  const frames = []
  const waiting = []
  const result = [...prices]
  const discounts = prices.map(() => null)
  const snapshot = (cursor, extra = {}) => ({
    cursor, waiting: [...waiting], result: [...result], discounts: [...discounts], ...extra,
  })
  frames.push({
    phase: 'start', activeLine: L('waiting = empty stack'), pythonLine: P('waiting = []'),
    message: 'Nothing is waiting yet. Every item still has its full price, and it will keep that price unless a later item discounts it.',
    scene: snapshot(-1),
  })
  for (let i = 0; i < prices.length; i++) {
    frames.push({
      phase: 'inspect', activeLine: L('for i from 0'), pythonLine: P('for i, price'),
      message: `Look at item ${i} with price ${prices[i]}. Earlier items still waiting with a price of ${prices[i]} or more will receive this price as their discount.`,
      scene: snapshot(i, { current: i }),
    })
    while (waiting.length && prices[waiting.at(-1)] >= prices[i]) {
      const j = waiting.pop()
      result[j] = prices[j] - prices[i]
      discounts[j] = prices[i]
      frames.push({
        phase: 'discount', activeLine: L('result[j] = prices[j] - prices[i]'), pythonLine: P('result[j] = prices[j] - price'),
        message: `Item ${j} (price ${prices[j]}) is discounted by ${prices[i]}, so its final price is ${result[j]}.`,
        scene: snapshot(i, { current: i, resolved: j }),
      })
    }
    waiting.push(i)
    frames.push({
      phase: 'wait', activeLine: L('push i onto waiting'), pythonLine: P('waiting.append(i)'),
      message: `Item ${i} has no later price that is at most its own price yet, so it waits on the stack with price ${prices[i]}.`,
      scene: snapshot(i, { current: i }),
    })
  }
  frames.push({
    phase: 'done', activeLine: L('return result'), pythonLine: P('return result'),
    message: `Items still waiting (indices ${waiting.length ? waiting.join(', ') : 'none'}) never found a discount and keep their full price. Final prices: ${result.join(', ')}.`,
    scene: snapshot(-1),
  })
  return { input: prices, result, frames }
}
