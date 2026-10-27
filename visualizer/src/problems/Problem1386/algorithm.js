const MAX_ROWS = 8
const MAX_RESERVED = 60
const SEATS = 10
const LEFT = [2, 3, 4, 5]
const MIDDLE = [4, 5, 6, 7]
const RIGHT = [6, 7, 8, 9]
const maskOf = seats => seats.reduce((mask, seat) => mask | (1 << seat), 0)
const LEFT_MASK = maskOf(LEFT)
const MIDDLE_MASK = maskOf(MIDDLE)
const RIGHT_MASK = maskOf(RIGHT)

export function parseInput(text) {
  const data = JSON.parse(text)
  const n = data?.n
  const reserved = data?.reserved_seats
  if (!Number.isInteger(n) || n < 1 || n > MAX_ROWS) throw new Error(`n must be a row count from 1 to ${MAX_ROWS}.`)
  if (!Array.isArray(reserved) || reserved.length > MAX_RESERVED) throw new Error(`reserved_seats must list up to ${MAX_RESERVED} [row, seat] pairs.`)
  for (const pair of reserved) {
    if (!Array.isArray(pair) || pair.length !== 2 || !Number.isInteger(pair[0]) || !Number.isInteger(pair[1])) throw new Error('Each reserved seat is a [row, seat] pair of integers.')
    if (pair[0] < 1 || pair[0] > n) throw new Error(`Rows run from 1 to ${n}.`)
    if (pair[1] < 1 || pair[1] > SEATS) throw new Error('Seats run from 1 to 10.')
  }
  return { n, reserved_seats: reserved }
}

export const code = `max number of four-person families(n, reserved_seats):
  set booked to an empty table of row to seat bitmask
  for each reserved [row, seat], set that seat's bit in booked for row
  set total to 2 times the rows with no reservation
  for each booked row:
    check whether the blocks seats 2-5, 6-9 and 4-7 are free
    find how many families fit: 2 if both ends are free, 1 if any block is free, else 0
    add that count to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, reserved_seats }) {
  const booked = new Map()
  for (const [row, seat] of reserved_seats) booked.set(row, (booked.get(row) ?? 0) | (1 << seat))
  const empty = n - booked.size
  let total = 2 * empty
  const frames = [{ phase: 'start', activeLine: L('set booked'), row: 0, mask: 0, total: 0, message: `${n} rows, ${booked.size} with reservations.` }]
  frames.push({ phase: 'empty', activeLine: L('set total to 2 times'), row: 0, mask: 0, total, message: `${empty} row(s) with no reservations seat two families each: total ${total}.` })
  for (const [row, mask] of [...booked.entries()].sort((a, b) => a[0] - b[0])) {
    const leftFree = !(mask & LEFT_MASK)
    const rightFree = !(mask & RIGHT_MASK)
    const middleFree = !(mask & MIDDLE_MASK)
    const count = leftFree && rightFree ? 2 : (leftFree || rightFree || middleFree ? 1 : 0)
    total += count
    frames.push({ phase: 'row', activeLine: L('find how many families fit'), row, mask, total, message: `Row ${row}: ${count} family(ies) fit; total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), row: 0, mask: 0, total, message: `Maximum number of four-person families: ${total}.` })
  return { input: { n, reserved_seats }, n, reserved_seats, result: total, frames }
}

export const python = `def max_number_of_families(n, reserved_seats):
    booked = {}
    for row, seat in reserved_seats:
        booked[row] = booked.get(row, 0) | (1 << seat)
    left = sum(1 << s for s in (2, 3, 4, 5))
    middle = sum(1 << s for s in (4, 5, 6, 7))
    right = sum(1 << s for s in (6, 7, 8, 9))
    total = 2 * (n - len(booked))
    for mask in booked.values():
        free_left = not (mask & left)
        free_right = not (mask & right)
        free_middle = not (mask & middle)
        if free_left and free_right:
            total += 2
        elif free_left or free_right or free_middle:
            total += 1
    return total
`
