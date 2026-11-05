export const phases = [
  { id: 'start', label: 'Start', description: 'Start with the original prices; a discount is applied only once a later price is no bigger.' },
  { id: 'read', label: 'Read price', description: 'Read the price at position i; it may be the discount for earlier prices still waiting.' },
  { id: 'discount', label: 'Apply discount', description: 'Each waiting price at the top of the stack gets a discount equal to the current price.' },
  { id: 'wait', label: 'Wait', description: 'Nothing waiting at the top is bigger, so push i and wait for a smaller or equal later price.' },
  { id: 'done', label: 'Complete', description: 'Prices still waiting on the stack get no discount.' },
]

export const examples = [
  { label: 'Mixed prices', input: '[8,4,6,2,7]' },
  { label: 'Equal prices', input: '[6,6,6]' },
  { label: 'Rising prices', input: '[1,2,3,4]' },
]

export function parseInput(text) {
  const prices = JSON.parse(text)
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 200) throw new Error('Use a JSON array of 1 to 200 prices.')
  if (!prices.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Every price must be an integer from 1 to 1000.')
  return prices
}

export function buildTrace(prices) {
  const result = [...prices]
  const stack = []
  const snap = (extra = {}) => ({ prices, result: [...result], stack: [...stack], scene: { waiting: [...stack] }, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const result = [...prices]'), pythonLine: P('result = list'), snapshot: snap(),
    message: 'Each price waits for the next price that is no bigger than it; that next price is the discount.' }]
  for (let i = 0; i < prices.length; i++) {
    frames.push({ phase: 'read', activeLine: L('for (let i = 0'), pythonLine: P('for i in range'), snapshot: snap({ current: i }),
      message: `Price ${prices[i]} at position ${i} is read.` })
    while (stack.length > 0 && prices[stack[stack.length - 1]] >= prices[i]) {
      const top = stack.pop()
      result[top] -= prices[i]
      frames.push({ phase: 'discount', activeLine: L('result[stack.pop()]'), pythonLine: P('result[top] -='), snapshot: snap({ current: i, top }),
        message: `${prices[top]} at position ${top} gets a discount of ${prices[i]}, leaving ${result[top]}.` })
    }
    stack.push(i)
    frames.push({ phase: 'wait', activeLine: L('stack.push(i)'), pythonLine: P('stack.append(i)'), snapshot: snap({ current: i }),
      message: `Position ${i} waits for a later price that is no bigger than ${prices[i]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), snapshot: snap({ current: null }),
    message: `Return [${result.join(', ')}]; the positions still waiting keep their full price.`, result })
  for (const f of frames) f.scene = { waiting: [...f.snapshot.stack] }
  return { input: prices, result, frames }
}

export const code = `function finalPrices(prices) {
  const result = [...prices], stack = []
  for (let i = 0; i < prices.length; i++) {
    while (stack.length > 0 && prices[stack.at(-1)] >= prices[i]) result[stack.pop()] -= prices[i]
    stack.push(i)
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def final_prices(prices):
    result = list(prices)
    stack = []
    for i in range(len(prices)):
        while stack and prices[stack[-1]] >= prices[i]:
            top = stack.pop()
            result[top] -= prices[i]
        stack.append(i)
    return result
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
