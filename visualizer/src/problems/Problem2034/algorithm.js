export const phases = [
  { id: 'start', label: 'Empty record', description: 'No timestamps are stored yet.' },
  { id: 'update', label: 'Update price', description: 'Setting a timestamp overwrites any earlier, wrong price at that time.' },
  { id: 'query', label: 'Answer query', description: 'Current is the latest timestamp; maximum and minimum look at every stored price.' },
  { id: 'done', label: 'Result', description: 'Return the answers to the queries in order.' },
]

export const code = `class StockPrice {
  constructor() {
    this.prices = new Map()
    this.latest = 0
  }

  update(timestamp, price) {
    this.prices.set(timestamp, price)
    this.latest = Math.max(this.latest, timestamp)
  }

  current() {
    return this.prices.get(this.latest)
  }

  maximum() {
    return Math.max(...this.prices.values())
  }

  minimum() {
    return Math.min(...this.prices.values())
  }
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `class StockPrice:
    def __init__(self):
        self.prices = {}
        self.latest = 0

    def update(self, timestamp, price):
        self.prices[timestamp] = price
        self.latest = max(self.latest, timestamp)

    def current(self):
        return self.prices[self.latest]

    def maximum(self):
        return max(self.prices.values())

    def minimum(self):
        return min(self.prices.values())
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let ops
  try { ops = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [["update",[1,10]],["current"],["maximum"]].') }
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 40) throw new Error('Give 1 to 40 operations.')
  for (const op of ops) {
    if (!Array.isArray(op)) throw new Error('Each operation is an array.')
    if (op[0] === 'update') {
      if (op.length !== 2 || !Array.isArray(op[1]) || !Number.isInteger(op[1][0]) || !Number.isInteger(op[1][1]) || op[1][0] < 1 || op[1][1] < 1 || op[1][1] > 1000) {
        throw new Error('update is ["update", [timestamp, price]] with timestamp >= 1 and price from 1 to 1000.')
      }
    } else if (!['current', 'maximum', 'minimum'].includes(op[0]) || op.length !== 1) {
      throw new Error('Queries are ["current"], ["maximum"] or ["minimum"].')
    }
  }
  if (ops[0][0] !== 'update') throw new Error('The first operation must be an update.')
  return ops
}

export function buildTrace(ops) {
  const frames = []
  const prices = new Map()
  let latest = 0
  const results = []
  const add = (phase, c, p, message, op) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { ops, op, prices: [...prices.entries()].sort((a, b) => a[0] - b[0]), latest, results: results.slice() },
  })
  add('start', 'this.prices = new Map', 'self.prices = {}', 'No prices are stored.', null)
  ops.forEach(op => {
    if (op[0] === 'update') {
      const [timestamp, price] = op[1]
      prices.set(timestamp, price)
      latest = Math.max(latest, timestamp)
      add('update', 'this.prices.set(timestamp', 'self.prices[timestamp]', `Set price ${price} at time ${timestamp}.`, op)
    } else {
      let value
      if (op[0] === 'current') value = prices.get(latest)
      else if (op[0] === 'maximum') value = Math.max(...prices.values())
      else value = Math.min(...prices.values())
      results.push(value)
      add('query', op[0] === 'current' ? 'return this.prices.get' : op[0] === 'maximum' ? 'return Math.max' : 'return Math.min', op[0] === 'current' ? 'return self.prices' : op[0] === 'maximum' ? 'return max(' : 'return min(', `${op[0]} = ${value}.`, op)
    }
  })
  add('done', 'return Math.min', 'return min(', `Answers: ${results.join(', ')}.`, null)
  return { input: ops, result: results, frames }
}
