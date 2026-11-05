export const phases = [
  { id: 'start', label: 'Sort both', description: 'Sorting seats and students pairs the k-th seat with the k-th student, which minimises the total distance.' },
  { id: 'pair', label: 'Pair in order', description: 'Each student walks to the seat in the same rank position.' },
  { id: 'done', label: 'Result', description: 'Return the total number of moves.' },
]

export const code = `function minMovesToSeat(seats, students) {
  const sortedSeats = [...seats].sort((a, b) => a - b)
  const sortedStudents = [...students].sort((a, b) => a - b)
  let moves = 0
  for (let i = 0; i < seats.length; i++) {
    moves += Math.abs(sortedSeats[i] - sortedStudents[i])
  }
  return moves
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_moves_to_seat(seats, students):
    sorted_seats = sorted(seats)
    sorted_students = sorted(students)
    moves = 0
    for i in range(len(seats)):
        moves += abs(sorted_seats[i] - sorted_students[i])
    return moves
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"seats":[3,1,5],"students":[2,7,4]}.') }
  const { seats, students } = obj || {}
  if (!Array.isArray(seats) || !Array.isArray(students) || seats.length < 1 || seats.length > 30 || seats.length !== students.length) {
    throw new Error('seats and students must have the same length, from 1 to 30 here.')
  }
  if (![...seats, ...students].every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Positions must be whole numbers from 1 to 100.')
  return { seats, students }
}

export function buildTrace({ seats, students }) {
  const frames = []
  const sortedSeats = [...seats].sort((a, b) => a - b)
  const sortedStudents = [...students].sort((a, b) => a - b)
  let moves = 0
  const add = (phase, c, p, message, i) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { sortedSeats, sortedStudents, index: i, moves },
  })
  add('start', 'const sortedSeats', 'sorted_seats = ', 'Seats and students are sorted by position.', -1)
  for (let i = 0; i < seats.length; i++) {
    const d = Math.abs(sortedSeats[i] - sortedStudents[i])
    moves += d
    add('pair', 'moves += Math.abs', 'moves += abs(', `Student at ${sortedStudents[i]} walks to seat ${sortedSeats[i]}: ${d} move(s).`, i)
  }
  add('done', 'return moves', 'return moves', `Total moves: ${moves}.`, seats.length - 1)
  return { input: { seats, students }, result: moves, frames }
}
