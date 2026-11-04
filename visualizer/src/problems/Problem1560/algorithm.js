export const phases = [
  { id: 'start', label: 'Start', description: 'Note the sector where the run starts and the sector where it finishes.' },
  { id: 'walk', label: 'Walk the laps', description: 'Each segment of the run moves clockwise between consecutive rounds; count how often each sector is passed.' },
  { id: 'range', label: 'Choose the range', description: 'The busiest sectors form one contiguous stretch from start to finish, wrapping past the last sector if needed.' },
  { id: 'done', label: 'Complete', description: 'Return the most visited sectors in increasing order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 4, "rounds": [1, 3, 1, 2]}.')
  const { n, rounds } = input
  if (!Number.isInteger(n) || n < 2 || n > 100) throw new Error('n is an integer from 2 to 100.')
  if (!Array.isArray(rounds) || rounds.length < 2 || rounds.length > 50) throw new Error('rounds is a list of 2 to 50 sectors.')
  if (!rounds.every(v => Number.isInteger(v) && v >= 1 && v <= n)) throw new Error('Each round is a sector from 1 to n.')
  for (let i = 0; i + 1 < rounds.length; i++) {
    if (rounds[i] === rounds[i + 1]) throw new Error('Consecutive rounds must start and finish on different sectors.')
  }
  return { n, rounds }
}

export function buildTrace({ n, rounds }) {
  const visits = Array(n + 1).fill(0)
  const counts = () => visits.slice(1)
  const snap = (segment, answer) => ({ visits: counts(), segment, answer })
  const start = rounds[0]
  const end = rounds[rounds.length - 1]
  visits[start] += 1
  const frames = [{
    phase: 'start', activeLine: L('start = rounds[0]'), pythonLine: P('start, end ='),
    snapshot: snap(null, null),
    message: `The run begins in sector ${start} and finishes in sector ${end}. The starting sector counts as one visit.`,
  }]
  for (let i = 0; i + 1 < rounds.length; i++) {
    const from = rounds[i]
    const to = rounds[i + 1]
    const entered = []
    for (let x = from; x !== to;) {
      x = (x % n) + 1
      visits[x] += 1
      entered.push(x)
    }
    frames.push({
      phase: 'walk', activeLine: L('laps cover'), pythonLine: P('# the clockwise'),
      snapshot: snap({ from, to, entered }, null),
      message: `Move clockwise from ${from} to ${to}; the sectors entered are ${entered.join(', ')}.`,
    })
  }
  const result = start <= end
    ? range(start, end)
    : [...range(1, end), ...range(start, n)]
  frames.push({
    phase: 'range', activeLine: L('if (start <= end)'), pythonLine: P('if start <= end'),
    snapshot: snap(null, result),
    message: start <= end
      ? `The run does not wrap, so the busiest sectors are ${start} through ${end}.`
      : `The run wraps past sector ${n} back to 1, so the busiest sectors are 1 through ${end} and ${start} through ${n}.`,
  })
  frames.push({
    phase: 'done', activeLine: L('return [...Array.from({ length: end }'), pythonLine: P('return list(range(1'),
    snapshot: snap(null, result), message: `Return [${result.join(', ')}].`,
  })
  return { input: { n, rounds }, result, frames }
}

function range(a, b) {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i)
}

export const code = [
  "function mostVisitedSectors(n, rounds) {",
  "  const start = rounds[0], end = rounds[rounds.length - 1]",
  "  // the laps cover only the clockwise run from start to end",
  "  if (start <= end) return Array.from({ length: end - start + 1 }, (_, i) => start + i)",
  "  return [...Array.from({ length: end }, (_, i) => i + 1), ...Array.from({ length: n - start + 1 }, (_, i) => start + i)] }",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def most_visited(n, rounds):
    # the clockwise run from start to end is the only stretch walked
    start, end = rounds[0], rounds[-1]
    if start <= end:
        return list(range(start, end + 1))
    return list(range(1, end + 1)) + list(range(start, n + 1))
`
