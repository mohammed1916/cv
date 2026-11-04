// Teaching rule: the first passenger picks a seat at random. Each later passenger keeps their own seat when it is free, and otherwise chooses at random. Only the first choice can make the last passenger's seat free or taken; the middle choices are symmetric and leave the answer at one half.

export const phases = [
  { id: 'start', label: 'Passenger 1', description: 'The first passenger picks any of the n seats uniformly at random.' },
  { id: 'seat1', label: 'Seat 1', description: 'The first passenger takes seat 1, so the last passenger finds their own seat free.' },
  { id: 'middle', label: 'Middle seats', description: 'The first passenger takes a middle seat. The displaced choices are symmetric between seat 1 and seat n, so the chance is one half.' },
  { id: 'seatN', label: 'Seat n', description: 'The first passenger takes the last passenger\'s seat, so it can never be theirs.' },
  { id: 'done', label: 'Result', description: 'Add the three contributions.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 3}.')
  if (!Number.isInteger(input.n) || input.n < 1 || input.n > 100000) throw new Error('n must be an integer from 1 to 100000.')
  return { n: input.n }
}

export function buildTrace({ n }) {
  const frames = []
  if (n === 1) {
    frames.push({
      phase: 'start', activeLine: L('if (n === 1)'), pythonLine: P('if n == 1'),
      message: 'With one passenger there is no competing seat, so the probability is 1.',
      snapshot: { n, seat1: 1, middle: 0, seatN: 0, running: 1 },
    })
    frames.push({
      phase: 'done', activeLine: L('return 1'), pythonLine: P('return 1.0'),
      message: 'The answer is 1.',
      snapshot: { n, seat1: 1, middle: 0, seatN: 0, running: 1 },
    })
    return { input: { n }, result: 1, frames }
  }
  const seat1 = 1 / n
  const middleCount = n - 2
  const middle = middleCount / n * 0.5
  const seatN = 0
  frames.push({
    phase: 'start', activeLine: L('const seat1 = 1 / n'), pythonLine: P('seat1 = 1 / n'),
    message: `The first passenger picks one of ${n} seats, each with probability 1/${n}.`,
    snapshot: { n, seat1: null, middle: null, seatN: null, running: 0 },
  })
  frames.push({
    phase: 'seat1', activeLine: L('const seat1 = 1 / n'), pythonLine: P('seat1 = 1 / n'),
    message: `Seat 1 is chosen with probability 1/${n}. Then the last passenger finds seat ${n} free, so this case contributes ${seat1.toFixed(6)}.`,
    snapshot: { n, seat1, middle: null, seatN: null, running: seat1 },
  })
  frames.push({
    phase: 'middle', activeLine: L('const middle = ((n - 2)'), pythonLine: P('middle ='),
    message: `${middleCount} middle seats each contribute half their probability, for a total of ${middle.toFixed(6)}.`,
    snapshot: { n, seat1, middle, seatN: null, running: seat1 + middle },
  })
  frames.push({
    phase: 'seatN', activeLine: L('const seatN = 0'), pythonLine: P('seatN ='),
    message: `Seat ${n} is chosen with probability 1/${n}, which takes the last passenger's seat. It contributes 0.`,
    snapshot: { n, seat1, middle, seatN, running: seat1 + middle },
  })
  const result = seat1 + middle + seatN
  frames.push({
    phase: 'done', activeLine: L('return seat1 + middle + seatN'), pythonLine: P('return seat1 + middle + seatN'),
    message: `Total: ${seat1.toFixed(6)} + ${middle.toFixed(6)} + 0 = ${result.toFixed(6)}.`,
    snapshot: { n, seat1, middle, seatN, running: result },
  })
  return { input: { n }, result, frames }
}

const codeLines = [
  "function nthPassengerSeatProbability(n) {",
  "  if (n === 1) return 1",
  "  const seat1 = 1 / n",
  "  const middle = ((n - 2) / n) * 0.5",
  "  const seatN = 0",
  "  return seat1 + middle + seatN",
  "}",
]
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

export const python = `def last_passenger_probability(n):
    if n == 1:
        return 1.0
    seat1 = 1 / n
    middle = (n - 2) / n * 0.5
    seatN = 0.0
    return seat1 + middle + seatN`

const pyLines = python.split('\n')
const L = s => {
  const i = codeLines.findIndex(t => t.includes(s))
  if (i < 0) throw new Error(`Missing code line: ${s}`)
  return i + 1
}
const P = s => {
  const i = pyLines.findIndex(t => t.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
