export function parseInput(text) {
  const row = JSON.parse(text)
  if (!Array.isArray(row) || row.length < 2 || row.length > 30 || row.length % 2 !== 0) throw new Error('Enter an even number of seats, 2 to 30.')
  const sorted = [...row].sort((a, b) => a - b)
  if (sorted.some((v, i) => v !== i)) throw new Error('Seats hold the people 0 to n-1 exactly once each.')
  return row
}

const JS_LINES = [
  'function minSwapsCouplesHoldingHands(row) {',
  '  const seats = row.slice() // seats[i] = person sitting in seat i',
  '  const at = new Array(seats.length) // at[p] = seat of person p',
  '  seats.forEach((p, i) => { at[p] = i })',
  '  let swaps = 0',
  '  for (let i = 0; i < seats.length; i += 2) { // seats i and i + 1 form a pair of seats',
  '    const partner = seats[i] ^ 1 // couples are (0, 1), (2, 3), ...',
  '    if (seats[i + 1] === partner) continue // this couple already sits together',
  '    const j = at[partner] // where the partner sits now',
  '    const other = seats[i + 1]',
  '    seats[j] = other; at[other] = j // move the seat-mate into the partner\'s old seat',
  '    seats[i + 1] = partner; at[partner] = i + 1 // seat the partner beside seats[i]',
  '    swaps++',
  '  }',
  '  return swaps // return the number of swaps',
  '}',
]
const PY_LINES = [
  'def min_swaps_couples(row):',
  '    seats = list(row)',
  '    at = [0] * len(seats)',
  '    for i, p in enumerate(seats):',
  '        at[p] = i',
  '    swaps = 0',
  '    for i in range(0, len(seats), 2):',
  '        partner = seats[i] ^ 1',
  '        if seats[i + 1] == partner:',
  '            continue',
  '        j = at[partner]',
  '        other = seats[i + 1]',
  '        seats[j] = other',
  '        at[other] = j',
  '        seats[i + 1] = partner',
  '        at[partner] = i + 1',
  '        swaps += 1',
  '    return swaps',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Walk the seats in pairs. If the seat-mate is not the partner, swap the mate with the partner's current seat.
export function buildTrace(row) {
  const seats = row.slice()
  const at = new Array(seats.length)
  seats.forEach((p, i) => { at[p] = i })
  let swaps = 0
  const frames = [{ phase: 'start', pair: null, seats: [...seats], swapped: [], swaps, activeLine: L('const seats = row'), pythonLine: P('seats = list'), message: 'Seats 0 and 1 form the first pair of seats; couples are the people (0, 1), (2, 3), and so on.' }]
  for (let i = 0; i < seats.length; i += 2) {
    const partner = seats[i] ^ 1
    if (seats[i + 1] === partner) {
      frames.push({ phase: 'together', pair: [i, i + 1], seats: [...seats], swapped: [], swaps, activeLine: L('continue'), pythonLine: P('continue'), message: `Seats ${i} and ${i + 1} already hold couple ${seats[i] >> 1}; nothing to do.` })
      continue
    }
    const j = at[partner]
    const other = seats[i + 1]
    seats[j] = other; at[other] = j
    seats[i + 1] = partner; at[partner] = i + 1
    swaps++
    frames.push({ phase: 'swap', pair: [i, i + 1], seats: [...seats], swapped: [i + 1, j], swaps, activeLine: L('seats[i + 1] = partner'), pythonLine: P('seats[i + 1] = partner'),
      message: `Seat ${i} holds ${seats[i]}, whose partner ${partner} sits in seat ${j}. Swap ${other} and ${partner}: swap ${swaps}.` })
  }
  frames.push({ phase: 'done', pair: null, seats: [...seats], swapped: [], swaps, result: swaps, activeLine: L('return the number of swaps'), pythonLine: P('return swaps'), message: `${swaps} swap${swaps === 1 ? '' : 's'} make every couple sit together.` })
  return { input: row, result: swaps, frames }
}
