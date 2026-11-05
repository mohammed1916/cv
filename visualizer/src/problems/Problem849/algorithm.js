export function parseInput(text) {
  const seats = JSON.parse(text)
  if (!Array.isArray(seats) || seats.length < 2 || seats.length > 60 || seats.some(v => v !== 0 && v !== 1)) throw new Error('Enter 2–60 seats as 0 (empty) and 1 (taken).')
  if (!seats.includes(0) || !seats.includes(1)) throw new Error('Seats need at least one empty seat and one taken seat.')
  return seats
}

const JS_LINES = [
  'function maxDistToClosest(seats) {',
  '  const n = seats.length',
  '  let best = 0, lastPerson = -1 // lastPerson: the nearest seated person on the left',
  '  for (let i = 0; i < n; i++) {',
  '    if (seats[i] === 1) { lastPerson = i; continue }',
  '    const nextPerson = seats.indexOf(1, i + 1) // the nearest seated person on the right, or -1',
  '    let distance = Infinity',
  '    if (lastPerson >= 0) distance = Math.min(distance, i - lastPerson)',
  '    if (nextPerson >= 0) distance = Math.min(distance, nextPerson - i)',
  '    best = Math.max(best, distance) // the empty seat furthest from everyone',
  '  }',
  '  return best',
  '}',
]
const PY_LINES = [
  'def max_dist_to_closest(seats):',
  '    n = len(seats)',
  '    best, last = 0, -1',
  '    for i in range(n):',
  '        if seats[i] == 1:',
  '            last = i',
  '            continue',
  '        next_person = seats.index(1, i + 1) if 1 in seats[i + 1:] else -1',
  '        distance = float(\'inf\')',
  '        if last >= 0:',
  '            distance = min(distance, i - last)',
  '        if next_person >= 0:',
  '            distance = min(distance, next_person - i)',
  '        best = max(best, distance)',
  '    return best',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// For each empty seat, the distance to the closest person is the smaller of the gaps to the nearest person on each side.
export function buildTrace(seats) {
  const n = seats.length
  let best = 0, bestSeat = -1
  const frames = [{ phase: 'start', seat: -1, distance: null, best, bestSeat, activeLine: L('let best = 0'), pythonLine: P('best, last'), message: 'Test every empty seat against its nearest neighbour who is seated.' }]
  for (let i = 0; i < n; i++) {
    if (seats[i] === 1) {
      frames.push({ phase: 'taken', seat: i, distance: null, best, bestSeat, activeLine: L('if (seats[i] === 1)'), pythonLine: P('if seats[i] == 1'), message: `Seat ${i} is taken.` })
      continue
    }
    let distance = Infinity
    for (let p = 0; p < n; p++) if (seats[p] === 1) distance = Math.min(distance, Math.abs(p - i))
    if (distance > best) { best = distance; bestSeat = i }
    frames.push({ phase: 'empty', seat: i, distance, best, bestSeat, activeLine: L('best = Math.max'), pythonLine: P('best = max(best, distance)'), message: `Seat ${i} is empty and ${distance} from the nearest person.` })
  }
  frames.push({ phase: 'done', seat: bestSeat, distance: best, best, bestSeat, result: best, activeLine: L('return best'), pythonLine: P('return best'), message: `Best seat ${bestSeat} keeps distance ${best}.` })
  return { input: seats, result: best, frames }
}
