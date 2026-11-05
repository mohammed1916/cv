// LeetCode 2110: Number of Smooth Descent Periods of a Stock.
// A smooth descent run ends at day i. Each day extends the run ending at the previous day when the price
// drops by exactly 1, otherwise it restarts at length 1. Every run of length m adds m periods.

export function parseInput(text) {
  let prices
  try { prices = JSON.parse(text) } catch { throw new Error('Use a JSON array of prices, e.g. [3,2,1,4].') }
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 40 || prices.some(v => !Number.isInteger(v) || v < 1 || v > 100)) {
    throw new Error('Use 1 to 40 integer prices from 1 to 100.')
  }
  return { prices }
}

export const code = `function smoothDescentPeriods(prices) {
  let total = 0
  let run = 0
  for (let i = 0; i < prices.length; i++) {
    if (i > 0 && prices[i - 1] - prices[i] === 1) run++
    else run = 1
    total += run
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: smooth_descent_periods
def smooth_descent_periods(prices):
    total = 0
    run = 0
    for i in range(len(prices)):
        if i > 0 and prices[i - 1] - prices[i] == 1:
            run += 1
        else:
            run = 1
        total += run
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
  { id: 'start', label: 'Day one', description: 'The first day starts a run of length 1.' },
  { id: 'extend', label: 'Extend run', description: 'The price fell by exactly 1, so the run grows.' },
  { id: 'restart', label: 'Restart run', description: 'The chain breaks, so a new run starts at this day.' },
  { id: 'done', label: 'Result', description: 'The sum of run lengths over all days.' },
]

export function buildTrace({ prices }) {
  const frames = []
  let total = 0
  let run = 0
  const runs = []
  prices.forEach((price, i) => {
    let phase
    if (i > 0 && prices[i - 1] - price === 1) { run++; phase = 'extend' }
    else { run = 1; phase = i === 0 ? 'start' : 'restart' }
    total += run
    runs.push(run)
    const message = phase === 'extend'
      ? `Price ${price} is exactly 1 below ${prices[i - 1]}; a run of ${run} ends here, adding ${run} periods.`
      : phase === 'start' ? `Day 0 starts a run of 1, adding 1 period.` : `Price ${price} breaks the chain; a new run of 1 starts, adding 1 period.`
    frames.push({ phase, activeLine: L(i > 0 ? 'if (i > 0' : 'let run = 0'), pythonLine: P('if i > 0 and'), message, i, run, total, runs: [...runs], marks: { [i]: 'day' } })
  })
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), message: `Total smooth descent periods: ${total}.`, i: -1, run, total, runs: [...runs], marks: {} })
  return { input: { prices }, result: total, frames }
}
