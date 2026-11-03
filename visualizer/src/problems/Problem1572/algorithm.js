export const phases = [
  { id: 'start', label: 'Start', description: 'Set the running total to 0. The grid is square, so both diagonals have one cell per row.' },
  { id: 'primary', label: 'Main diagonal', description: 'In each row, add the cell on the main diagonal (row = column).' },
  { id: 'secondary', label: 'Anti-diagonal', description: 'In each row, add the mirror cell on the other diagonal (column = n - 1 - row).' },
  { id: 'center', label: 'Shared centre', description: 'In an odd-sized grid the two diagonals meet at one cell. It is already counted, so skip it.' },
  { id: 'done', label: 'Complete', description: 'The total covers every diagonal cell exactly once.' },
]

export function parseInput(text) {
  const mat = JSON.parse(text)
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 8) throw new Error('Enter a JSON array of 1 to 8 rows.')
  const n = mat.length
  const ok = mat.every(row => Array.isArray(row) && row.length === n && row.every(v => Number.isInteger(v) && Math.abs(v) <= 9))
  if (!ok) throw new Error(`Every row must have ${n} integers from -9 to 9, because the grid is ${n} by ${n}.`)
  return mat
}

export const code = [
  'function diagonal_sum(mat):',
  '  n = number of rows',
  '  total = 0',
  '  for i from 0 to n - 1:',
  '    total = total + mat[i][i]',
  '    j = n - 1 - i',
  '    if i != j:',
  '      total = total + mat[i][j]',
  '  return total',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def diagonal_sum(mat):
    n = len(mat)
    total = 0
    for i in range(n):
        total += mat[i][i]
        j = n - 1 - i
        if i != j:
            total += mat[i][j]
    return total`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(mat) {
  const n = mat.length
  let total = 0
  const counted = []
  const snap = (extra = {}) => ({ total, counted: counted.map(cell => [...cell]), ...extra })
  const frames = [{ phase: 'start', activeLine: L('total = 0'), pythonLine: P('total = 0'), snapshot: snap(), message: `A ${n} by ${n} grid. Walk down the rows and add the two diagonal cells of each row, counting a shared centre once.` }]
  for (let i = 0; i < n; i++) {
    const j = n - 1 - i
    total += mat[i][i]
    counted.push([i, i])
    frames.push({ phase: 'primary', activeLine: L('total = total + mat[i][i]'), pythonLine: P('total += mat[i][i]'), snapshot: snap({ row: i, col: i }), message: `Row ${i}: add the main-diagonal cell ${mat[i][i]}. Total ${total}.` })
    if (i !== j) {
      total += mat[i][j]
      counted.push([i, j])
      frames.push({ phase: 'secondary', activeLine: L('total = total + mat[i][j]'), pythonLine: P('total += mat[i][j]'), snapshot: snap({ row: i, col: j }), message: `Row ${i}: add the anti-diagonal cell ${mat[i][j]} in column ${j}. Total ${total}.` })
    } else {
      frames.push({ phase: 'center', activeLine: L('if i != j'), pythonLine: P('if i != j'), snapshot: snap({ row: i, col: i }), message: `Row ${i} is the centre, where both diagonals meet. Its cell was already added, so it is skipped.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), snapshot: snap(), message: `The diagonal sum is ${total}.` })
  return { input: mat, result: total, frames }
}
