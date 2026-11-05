// LeetCode 2147: Number of Ways to Divide a Long Corridor.
// Seats come in pairs, each pair forming one section. Between the second seat of a pair and the first seat of
// the next pair, a divider may go in any of the (gap) positions that hold only plants. The answer multiplies
// those counts; an odd or zero number of seats gives 0.

export function parseInput(text) {
  const corridor = text.trim()
  if (!/^[SP]{1,40}$/.test(corridor)) throw new Error('Use a corridor of 1 to 40 letters, each S (seat) or P (plant).')
  return { corridor }
}

export const code = `function numberOfWays(corridor) {
  const MOD = 1000000007n
  const seats = []
  for (let i = 0; i < corridor.length; i++) if (corridor[i] === 'S') seats.push(i)
  if (seats.length === 0 || seats.length % 2 === 1) return 0
  let ways = 1n
  for (let j = 1; j + 1 < seats.length; j += 2) {
    ways = (ways * BigInt(seats[j + 1] - seats[j])) % MOD
  }
  return Number(ways)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: number_of_ways
def number_of_ways(corridor):
    MOD = 1000000007
    seats = [i for i, ch in enumerate(corridor) if ch == "S"]
    if len(seats) == 0 or len(seats) % 2 == 1:
        return 0
    ways = 1
    for j in range(1, len(seats) - 1, 2):
        ways = (ways * (seats[j + 1] - seats[j])) % MOD
    return ways
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
  { id: 'seats', label: 'Find seats', description: 'Record the position of each seat.' },
  { id: 'gap', label: 'Divider gap', description: 'Between a pair and the next pair, count the places a divider fits.' },
  { id: 'done', label: 'Result', description: 'The product of all gap counts.' },
]

export function buildTrace({ corridor }) {
  const frames = []
  const MOD = 1000000007n
  const seats = []
  for (let i = 0; i < corridor.length; i++) if (corridor[i] === 'S') seats.push(i)
  frames.push({ phase: 'seats', activeLine: L('const seats = []'), pythonLine: P('seats = [i'), message: `${seats.length} seats at positions ${seats.join(', ') || 'none'}.`, marks: Object.fromEntries(seats.map(p => [p, 'seat'])), ways: null })
  if (seats.length === 0 || seats.length % 2 === 1) {
    frames.push({ phase: 'done', activeLine: L('return 0'), pythonLine: P('return 0'), message: seats.length === 0 ? 'No seats, so no valid division.' : 'An odd number of seats cannot form pairs.', marks: {}, ways: 0 })
    return { input: { corridor }, result: 0, frames }
  }
  let ways = 1n
  for (let j = 1; j + 1 < seats.length; j += 2) {
    const gap = seats[j + 1] - seats[j]
    ways = (ways * BigInt(gap)) % MOD
    frames.push({ phase: 'gap', activeLine: L('ways = (ways *'), pythonLine: P('ways = (ways *'), message: `Between seats ${seats[j]} and ${seats[j + 1]} there are ${gap - 1} plants: ${gap} places for a divider.`, marks: { ...Object.fromEntries(seats.map(p => [p, 'seat'])), [seats[j]]: 'pair end', [seats[j + 1]]: 'next pair start' }, ways: Number(ways) })
  }
  const result = Number(ways)
  frames.push({ phase: 'done', activeLine: L('return Number'), pythonLine: P('return ways'), message: `Ways: ${result}.`, marks: {}, ways: result })
  return { input: { corridor }, result, frames }
}
