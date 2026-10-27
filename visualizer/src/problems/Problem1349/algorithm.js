const MAX_ROWS = 5
const MAX_COLS = 4

export function parseInput(text) {
  const data = JSON.parse(text)
  const seats = data?.seats
  if (!Array.isArray(seats) || seats.length < 1 || seats.length > MAX_ROWS) throw new Error(`seats must list 1 to ${MAX_ROWS} rows.`)
  const cols = typeof seats[0] === 'string' ? seats[0].length : 0
  if (cols < 1 || cols > MAX_COLS) throw new Error(`Each row must have 1 to ${MAX_COLS} seats.`)
  for (const row of seats) {
    if (typeof row !== 'string' || row.length !== cols) throw new Error('Every row must be a string of the same length.')
    if (![...row].every(ch => ch === '.' || ch === '#')) throw new Error("Use '.' for a working seat and '#' for a broken seat.")
  }
  return { seats }
}

const bits = m => { let count = 0; for (let x = m; x; x &= x - 1) count++; return count }

export const code = `maximum students(seats)
  set best to {the empty seating: 0} for the empty row above
  for each row of seats
    set next to nothing
    for each seating that uses working seats and has no two students side by side
      find the largest best value whose seating does not clash with this seating
      store that value plus the students in this seating in next
    set best to next
  return the largest value in best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// A seating is a bitmask: bit c is set when a student sits in column c of the row.
export function buildTrace({ seats }) {
  const cols = seats[0].length
  const size = 1 << cols
  const usable = seats.map(row => [...row].reduce((mask, ch, c) => (ch === '.' ? mask | (1 << c) : mask), 0))
  const isValid = mask => (mask & (mask << 1)) === 0
  // A student clashes with the row above when the row above has a student upper-left or upper-right.
  const clashes = (mask, above) => (mask & (above << 1)) !== 0 || (mask & (above >> 1)) !== 0
  const label = mask => mask.toString(2).padStart(cols, '0')
  const table = values => Array.from({ length: size }, (_, m) => (values.has(m) ? values.get(m) : '–'))
  let best = new Map([[0, 0]])
  const frames = [{ phase: 'start', row: -1, mask: null, dp: table(best), activeLine: L('set best to'), message: 'Begin with an empty row above the hall. It clashes with no seating.' }]
  seats.forEach((_, r) => {
    const next = new Map()
    frames.push({ phase: 'row', row: r, mask: null, dp: table(next), activeLine: L('for each row of seats'), message: `Row ${r + 1}: try every seating on working seats that has no two students side by side.` })
    for (let mask = 0; mask < size; mask++) {
      if ((mask & ~usable[r]) !== 0 || !isValid(mask)) continue
      let prior = -1
      for (const [above, value] of best) if (!clashes(mask, above) && value > prior) prior = value
      if (prior < 0) continue
      next.set(mask, prior + bits(mask))
      frames.push({ phase: 'mask', row: r, mask, dp: table(next), activeLine: L('find the largest best value'), message: `Row ${r + 1}, seating ${label(mask)}: ${bits(mask)} student(s) plus the best compatible total above gives ${next.get(mask)}.` })
    }
    best = next
  })
  const result = Math.max(0, ...best.values())
  frames.push({ phase: 'done', row: seats.length - 1, mask: null, dp: table(best), activeLine: L('return the largest value'), result, message: `Most students that can sit without seeing a neighbour's answer: ${result}.` })
  return { input: { seats }, seats, result, frames }
}

export const python = `def max_students(seats):
    cols = len(seats[0])
    best = {0: 0}
    for row in seats:
        usable = 0
        for c, ch in enumerate(row):
            if ch == '.':
                usable |= 1 << c
        nxt = {}
        for mask in range(1 << cols):
            if mask & ~usable or mask & (mask << 1):
                continue
            prior = [value for above, value in best.items()
                     if (mask & (above << 1)) == 0 and (mask & (above >> 1)) == 0]
            if prior:
                nxt[mask] = max(prior) + bin(mask).count('1')
        best = nxt
    return max(best.values(), default=0)
`
