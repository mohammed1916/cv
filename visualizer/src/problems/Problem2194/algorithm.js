// LeetCode 2194: Cells in a Range on an Excel Sheet.
// Read the two corners of "A1:B3": the columns run from the first letter to the second, and the rows run from the
// first digit to the second. Emit column by column, rows top to bottom within each column.

const MAX_COLUMN = 'F'

export function parseInput(text) {
  const s = String(text).trim().replace(/^"|"$/g, '')
  const match = /^([A-Z])([1-9]):([A-Z])([1-9])$/.exec(s)
  if (!match) throw new Error('Use a range like A1:C3, with one capital letter and one digit 1-9 at each corner.')
  const [, c1, r1, c2, r2] = match
  if (c1 > c2 || Number(r1) > Number(r2)) throw new Error('The first corner must be above and left of the second.')
  if (c2 > MAX_COLUMN) throw new Error(`Columns run up to ${MAX_COLUMN} in this visualization.`)
  return { range: s, c1, r1: Number(r1), c2, r2: Number(r2) }
}

export const code = `FUNCTION cellsInRange(s)
    c1 ← first letter of s, r1 ← first digit of s
    c2 ← letter after the colon, r2 ← digit after the colon
    result ← empty list
    FOR each column c from c1 to c2
        FOR each row r from r1 to r2
            append c followed by r to result
    RETURN result`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def cells_in_range(s):
    result = []
    for col in range(ord(s[0]), ord(s[3]) + 1):
        for row in range(int(s[1]), int(s[4]) + 1):
            result.append(chr(col) + str(row))
    return result
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
  { id: 'corners', label: 'Corners', description: 'Read the two corner cells.' },
  { id: 'walk', label: 'Walk', description: 'Go column by column, and down each column row by row.' },
  { id: 'done', label: 'Result', description: 'Every cell in the rectangle.' },
]

export function buildTrace({ range, c1, r1, c2, r2 }) {
  const frames = []
  const result = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index: -1, activeLine, pythonLine, message, range, c1, r1, c2, r2, result: result.slice(), ...extra })
  push('corners', L('c1 ← first letter'), P('result = []'), `Corners ${c1}${r1} and ${c2}${r2}: ${c2.charCodeAt(0) - c1.charCodeAt(0) + 1} column(s) and ${r2 - r1 + 1} row(s).`)
  for (let c = c1.charCodeAt(0); c <= c2.charCodeAt(0); c++) {
    for (let r = r1; r <= r2; r++) {
      const cell = String.fromCharCode(c) + r
      result.push(cell)
      push('walk', L('append c followed by r'), P('result.append(chr(col)'), `Add ${cell}. Column ${String.fromCharCode(c)} runs from row ${r1} to row ${r2}.`, { cell, col: String.fromCharCode(c), row: r })
    }
  }
  push('done', L('RETURN result'), P('return result'), `${result.length} cells in the range.`, { result: result.slice() })
  return { input: { range, c1, r1, c2, r2 }, result, frames }
}
