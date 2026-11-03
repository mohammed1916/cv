export const phases = [
  { id: 'build', label: 'Build rows', description: 'Start each row with 1s at both ends, then fill each interior entry from the row above.' },
  { id: 'done', label: 'Complete', description: 'Return all rows.' },
]

const CODE = [
  'function generate(numRows):',
  '  rows = []',
  '  for r from 0 to numRows - 1:',
  '    row = [1] repeated r + 1 times',
  '    for c from 1 to r - 1:',
  '      row[c] = previous[c-1] + previous[c]',
  '    rows.append(row)',
  '  return rows',
]
const PY = [
  'def generate(num_rows):',
  '    rows = []',
  '    for r in range(num_rows):',
  '        row = [1] * (r + 1)',
  '        for c in range(1, r):',
  '            row[c] = rows[r - 1][c - 1] + rows[r - 1][c]',
  '        rows.append(row)',
  '    return rows',
]

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n')

const L = { init: 2, row: 4, cell: 6, add: 7, ret: 8 }
const P = { init: 2, row: 4, cell: 6, add: 7, ret: 8 }

export function parseInput(text) {
  const n = Number(String(text).trim())
  if (!Number.isInteger(n) || n < 1 || n > 30) throw new Error('Enter one whole number of rows from 1 to 30.')
  return n
}

export function buildTrace(numRows) {
  const frames = []
  const rows = []
  const state = { numRows, row: null, cell: null, current: null, rows }
  const push = (phase, key, message) => frames.push({
    phase, activeLine: L[key], pythonLine: P[key], message,
    snapshot: { ...state, rows: rows.map(r => [...r]), current: state.current ? [...state.current] : null },
  })

  push('build', 'init', `Build ${numRows} row${numRows === 1 ? '' : 's'}. The list of finished rows starts empty.`)
  for (let r = 0; r < numRows; r++) {
    const row = Array(r + 1).fill(1)
    Object.assign(state, { row: r, cell: null, current: row })
    push('build', 'row', `Start row ${r + 1}. Its first and last entries are 1.`)
    for (let c = 1; c < r; c++) {
      const above = rows[r - 1]
      row[c] = above[c - 1] + above[c]
      Object.assign(state, { cell: c, current: row })
      push('build', 'cell', `Entry ${c} is ${above[c - 1]} + ${above[c]} = ${row[c]}, the two entries above it.`)
    }
    rows.push(row)
    Object.assign(state, { cell: null, current: null })
    push('build', 'add', `Row ${r + 1} is complete: [${row.join(', ')}].`)
  }

  push('done', 'ret', `The triangle has ${numRows} row${numRows === 1 ? '' : 's'}.`)
  return { input: numRows, result: rows, frames }
}
