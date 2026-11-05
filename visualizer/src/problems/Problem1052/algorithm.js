export const phases = [
  { id: 'start', label: 'Start', description: 'Read the customers, the grumpy minutes and the window length.' },
  { id: 'baseline', label: 'Baseline', description: 'Customers in calm minutes are always satisfied. Add them once.' },
  { id: 'window', label: 'First window', description: 'Recoverable customers in the first window of the given length.' },
  { id: 'slide', label: 'Slide window', description: 'Move the window one minute right: add the entering minute, drop the leaving one.' },
  { id: 'best', label: 'Best window', description: 'Keep the largest recoverable total seen so far.' },
  { id: 'done', label: 'Complete', description: 'The baseline plus the best recoverable total is the answer.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.customers) || !Array.isArray(data.grumpy) || !Number.isInteger(data.minutes)) {
    throw new Error('Use an object with customers, grumpy and minutes, for example {"customers":[1,2],"grumpy":[0,1],"minutes":1}.')
  }
  const { customers, grumpy, minutes } = data
  if (customers.length < 1 || customers.length > 40) throw new Error('customers must have 1 to 40 minutes.')
  if (grumpy.length !== customers.length) throw new Error('grumpy must have one entry per minute.')
  if (!customers.every(c => Number.isInteger(c) && c >= 0 && c <= 1000)) throw new Error('Each customer count must be an integer from 0 to 1000.')
  if (!grumpy.every(g => g === 0 || g === 1)) throw new Error('Each grumpy entry must be 0 or 1.')
  if (minutes < 1 || minutes > customers.length) throw new Error('minutes must be between 1 and the number of minutes.')
  return { customers, grumpy, minutes }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function maxSatisfied(customers, grumpy, minutes) {', 'def max_satisfied(customers, grumpy, minutes):'],
  ['  let base = 0', '    base = 0'],
  ['  for (let i = 0; i < customers.length; i++) if (grumpy[i] === 0) base += customers[i]', '    for i in range(len(customers)): base += customers[i] * (1 - grumpy[i])'],
  ['  let window = 0', '    window = 0'],
  ['  for (let i = 0; i < minutes; i++) window += customers[i] * grumpy[i]', '    for i in range(minutes): window += customers[i] * grumpy[i]'],
  ['  let best = window', '    best = window'],
  ['  for (let end = minutes; end < customers.length; end++) {', '    for end in range(minutes, len(customers)):'],
  ['    window += customers[end] * grumpy[end] - customers[end - minutes] * grumpy[end - minutes]', '        window += customers[end] * grumpy[end] - customers[end - minutes] * grumpy[end - minutes]'],
  ['    best = Math.max(best, window)', '        best = max(best, window)'],
  ['  }', ''],
  ['  return base + best', '    return base + best'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { customers, grumpy, minutes } = input
  const frames = []
  const calm = customers.reduce((sum, c, i) => sum + (grumpy[i] === 0 ? c : 0), 0)
  const recoverable = i => customers[i] * grumpy[i]
  let window = 0
  for (let i = 0; i < minutes; i++) window += recoverable(i)
  let best = window
  let bestStart = 0
  let start = 0

  const frame = (phase, pythonKey, activeKey, message) => frames.push({
    phase, pythonLine: P(pythonKey), activeLine: L(activeKey), message,
    snapshot: {
      customers, grumpy, minutes, calm,
      windowStart: start, windowEnd: start + minutes, window, best, bestStart,
    },
  })

  frame('start', 'base = 0', 'let base = 0', `Window length ${minutes} over ${customers.length} minutes. A window can recover grumpy minutes only.`)
  frame('baseline', 'for i in range(len(customers))', 'base += customers[i]', `Calm minutes already satisfy ${calm} customers, so they count once and never change.`)
  frame('window', 'for i in range(minutes)', 'window += customers[i] * grumpy[i]', `The first window covers minutes 0 to ${minutes - 1}. It recovers ${window} customers.`)
  frame('best', 'best = window', 'let best = window', `Best so far is ${best}, from the window starting at minute 0.`)
  for (let end = minutes; end < customers.length; end++) {
    start = end - minutes + 1
    window += recoverable(end) - recoverable(end - minutes)
    frame('slide', 'window += customers[end]', 'window += customers[end] * grumpy[end]', `Shift the window to minutes ${start} to ${end}: add minute ${end}, drop minute ${end - minutes}. It recovers ${window}.`)
    if (window > best) { best = window; bestStart = start }
    frame('best', 'best = max', 'best = Math.max', `${window} against best ${best}${window === best && bestStart === start ? ' (new best)' : ''}.`)
  }
  const result = calm + best
  frames.push({
    phase: 'done', pythonLine: P('return base + best'), activeLine: L('return base + best'),
    message: `Answer: ${calm} calm plus ${best} recovered gives ${result}.`,
    snapshot: { customers, grumpy, minutes, calm, windowStart: bestStart, windowEnd: bestStart + minutes, window: best, best, bestStart },
  })
  return { input, result, frames }
}
