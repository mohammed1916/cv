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

const pseudo = `max_satisfied(customers, grumpy, minutes):
  base = total of customers where grumpy is 0
  window = recoverable customers in the first window
  best = window
  for each later window end:
    window = window + entering minute - leaving minute
    best = maximum of best and window
  return base + best`
const py = `def max_satisfied(customers, grumpy, minutes):
    base = sum(c for c, g in zip(customers, grumpy) if g == 0)
    window = sum(c for c, g in zip(customers[:minutes], grumpy[:minutes]) if g == 1)
    best = window
    for end in range(minutes, len(customers)):
        window += customers[end] * grumpy[end] - customers[end - minutes] * grumpy[end - minutes]
        best = max(best, window)
    return base + best`

export const code = pseudo.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = py

const LINE = { start: 1, baseline: 2, window: 3, slide: 6, best: 7, done: 8 }

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

  const frame = (phase, activeLine, message) => frames.push({
    phase, activeLine, message,
    snapshot: {
      customers, grumpy, minutes, calm,
      windowStart: start, windowEnd: start + minutes, window, best, bestStart,
    },
  })

  frame('start', LINE.start, `Window length ${minutes} over ${customers.length} minutes. A window can recover grumpy minutes only.`)
  frame('baseline', LINE.baseline, `Calm minutes already satisfy ${calm} customers, so they count once and never change.`)
  frame('window', LINE.window, `The first window covers minutes 0 to ${minutes - 1}. It recovers ${window} customers.`)
  frame('best', LINE.best, `Best so far is ${best}, from the window starting at minute 0.`)
  for (let end = minutes; end < customers.length; end++) {
    start = end - minutes + 1
    window += recoverable(end) - recoverable(end - minutes)
    frame('slide', LINE.slide, `Shift the window to minutes ${start} to ${end}: add minute ${end}, drop minute ${end - minutes}. It recovers ${window}.`)
    if (window > best) { best = window; bestStart = start }
    frame('best', LINE.best, `${window} against best ${best}${window === best && bestStart === start ? ' (new best)' : ''}.`)
  }
  const result = calm + best
  frames.push({
    phase: 'done', activeLine: LINE.done,
    message: `Answer: ${calm} calm plus ${best} recovered gives ${result}.`,
    snapshot: { customers, grumpy, minutes, calm, windowStart: bestStart, windowEnd: bestStart + minutes, window: best, best, bestStart },
  })
  return { input, result, frames }
}
