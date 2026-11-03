export const phases = [
  { id: 'start', label: 'Start', description: 'Count the odd integers from low to high, inclusive.' },
  { id: 'high', label: 'Odds up to high', description: 'Count the odd integers from 0 through high.' },
  { id: 'low', label: 'Odds below low', description: 'Count the odd integers from 0 through low - 1 and set them aside.' },
  { id: 'difference', label: 'Subtract', description: 'The odds in the interval are the first count minus the second.' },
  { id: 'done', label: 'Complete', description: 'Return the number of odd integers in the interval.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"low": 3, "high": 7}.')
  const { low, high } = input
  if (!Number.isInteger(low) || !Number.isInteger(high)) throw new Error('low and high must be integers.')
  if (low < 0 || high > 1000000000 || low > high) throw new Error('Use integers with 0 <= low <= high <= 1000000000.')
  return { low, high }
}

export const code = `count odd integers in [low, high]:
  upto_high = (high + 1) // 2
  below_low = low // 2
  return upto_high - below_low`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_odds(low, high):
    upto_high = (high + 1) // 2
    below_low = low // 2
    return upto_high - below_low
`

const LINE = { start: 1, high: 2, low: 3, difference: 4, done: 4 }

export function buildTrace({ low, high }) {
  const snap = (upto, below, answer) => ({ low, high, upto, below, answer })
  const frames = [{ phase: 'start', activeLine: LINE.start, pythonLine: LINE.start, snapshot: snap(null, null, null), message: `Count the odd integers from ${low} to ${high}. Count the odds up to high, then remove the odds below low.` }]
  const upto = Math.floor((high + 1) / 2)
  frames.push({ phase: 'high', activeLine: LINE.high, pythonLine: LINE.high, snapshot: snap(upto, null, null), message: `Odd integers from 0 to ${high}: (${high} + 1) // 2 = ${upto}.` })
  const below = Math.floor(low / 2)
  frames.push({ phase: 'low', activeLine: LINE.low, pythonLine: LINE.low, snapshot: snap(upto, below, null), message: `Odd integers below ${low}: ${low} // 2 = ${below}.` })
  const answer = upto - below
  frames.push({ phase: 'difference', activeLine: LINE.difference, pythonLine: LINE.difference, snapshot: snap(upto, below, answer), message: `${upto} - ${below} = ${answer} odd integers in the interval.` })
  frames.push({ phase: 'done', activeLine: LINE.done, pythonLine: LINE.done, snapshot: snap(upto, below, answer), message: `Answer: ${answer}.` })
  return { input: { low, high }, result: answer, frames }
}
