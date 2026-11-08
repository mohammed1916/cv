// Average waiting time: the chef starts each order when free or when the customer arrives, whichever is later.
const JS_LINES = [
  { text: 'let current = 0', py: 'current = 0' },
  { text: 'let total = 0', py: 'total = 0' },
  { text: 'for (const [arrival, time] of customers) {', py: 'for arrival, time in customers' },
  { text: 'const start = Math.max(current, arrival)', py: 'start = max(' },
  { text: 'const finish = start + time', py: 'finish = start + time' },
  { text: 'total += finish - arrival', py: 'total += finish - arrival' },
  { text: 'current = finish', py: 'current = finish' },
  { text: '}', py: null },
  { text: 'return total / customers.length', py: 'return total' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def averageWaitingTime(customers):
    current = 0
    total = 0
    for arrival, time in customers:
        start = max(current, arrival)
        finish = start + time
        total += finish - arrival
        current = finish
    return total / len(customers)
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return total')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'The chef is free at time 0.' },
  { id: 'cook', label: 'Cook', description: 'Cooking starts when the chef is free or the order arrives, whichever is later.' },
  { id: 'wait', label: 'Wait', description: 'The customer waits from arrival until the dish is finished.' },
  { id: 'done', label: 'Result', description: 'The average of all the waits.' },
]

export const examples = [
  { label: 'Chef busy at arrival', input: '[[2,4],[3,2],[9,1]]' },
  { label: 'Chef always free', input: '[[1,1],[5,2]]' },
  { label: 'Single customer', input: '[[1,1]]' },
  { label: 'Same arrival moment', input: '[[5,3],[5,2]]' },
  { label: 'Latest arrival listed first', input: '[[100000,100],[1,1]]' },
  { label: 'Long run: 12 customers', input: '[[6268,57],[11559,64],[16303,48],[27765,2],[37827,31],[44089,61],[49784,93],[58734,35],[65562,17],[73931,6],[80447,92],[91264,23]]' },
]

export const complexity = 'O(n) time and O(1) extra space for n customers.'

export function parseInput(text) {
  const customers = JSON.parse(text)
  if (!Array.isArray(customers) || customers.length < 1 || customers.length > 12) throw new Error('Use a JSON array of 1 to 12 [arrival, time] pairs (visual cap).')
  for (const [arrival, time] of customers) {
    if (!Number.isInteger(arrival) || !Number.isInteger(time) || arrival < 1 || time < 1 || arrival > 100000 || time > 100) throw new Error('Arrivals are integers from 1 to 100000 and times from 1 to 100.')
  }
  return customers
}

export function buildTrace(customers) {
  const frames = []
  const orders = []
  let current = 0
  let total = 0
  const snap = extra => ({ current, total, orders: [...orders], ...extra })
  frames.push({ phase: 'start', activeLine: 1, index: -1, message: 'The chef is free at time 0.', snapshot: snap({}) })
  customers.forEach(([arrival, time], i) => {
    const start = Math.max(current, arrival)
    const finish = start + time
    total += finish - arrival
    current = finish
    orders.push({ arrival, start, finish, wait: finish - arrival })
    frames.push({ phase: 'cook', activeLine: 4, index: i, message: `Order ${i + 1} arrives at ${arrival}, starts at ${start}, done at ${finish}.`, snapshot: snap({}) })
    frames.push({ phase: 'wait', activeLine: 6, index: i, message: `Waiting time ${finish - arrival}; total ${total}.`, snapshot: snap({}) })
  })
  const result = total / customers.length
  frames.push({ phase: 'done', activeLine: 9, index: -1, result, message: `Average waiting time ${result}.`, snapshot: snap({ result }) })
  return { input: customers, result, frames }
}
