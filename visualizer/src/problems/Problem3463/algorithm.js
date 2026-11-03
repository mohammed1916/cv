const DIGITS = /^[0-9]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 3 || s.length > 12 || !DIGITS.test(s)) throw new Error('s has 3 to 12 digits.')
  return { s }
}

export function buildTrace({ s }) {
  const frames = []
  let row = [...s].map(Number)
  frames.push({ pythonLine: P('row = '), phase: 'start', activeLine: L('start with the digits'), row: [...row], at: -1, next: [], ok: null, message: `Start with ${row.join('')}.` })
  while (row.length > 2) {
    frames.push({ pythonLine: P('while'), phase: 'round', activeLine: L('while more than two'), row: [...row], at: -1, next: [], ok: null, message: `${row.length} digits remain; combine neighbours.` })
    const next = []
    for (let i = 0; i + 1 < row.length; i++) {
      next.push((row[i] + row[i + 1]) % 10)
      frames.push({ pythonLine: P('for i in'), phase: 'pair', activeLine: L('append'), row: [...row], at: i, next: [...next], ok: null, message: `(${row[i]} + ${row[i + 1]}) mod 10 = ${next[i]}.` })
    }
    row = next
  }
  const equal = row[0] === row[1]
  frames.push({ pythonLine: P('return row'), phase: 'done', activeLine: L('return whether'), row: [...row], at: -1, next: [], ok: equal, message: `Final digits ${row[0]} and ${row[1]} are ${equal ? 'equal' : 'different'}.` })
  return { input: { s }, result: equal, frames }
}

export const code = `check whether the final two digits are equal
  start with the digits of s as the current row
  while the row has more than two digits
    build a new row
    for each neighbouring pair i and i plus 1
      append (row[i] plus row[i + 1]) mod 10
    replace the row with the new row
  return whether the two remaining digits are equal`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def digits_equal(s):
    row = [int(c) for c in s]
    while len(row) > 2:
        next_row = []
        for i in range(len(row) - 1):
            next_row.append((row[i] + row[i + 1]) % 10)
        row = next_row
    return row[0] == row[1]
`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
