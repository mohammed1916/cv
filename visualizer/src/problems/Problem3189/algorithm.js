// LeetCode 3189: Minimum Moves to Get a Peaceful Board.
// Rows and columns can be fixed independently: the rook with the i-th smallest row
// moves to row i, and the rook with the j-th smallest column moves to column j.

const CODE_TEXT = [
  'FUNCTION minMoves(n, rooks)',
  '    rows ← sorted row of each rook',
  '    cols ← sorted column of each rook',
  '    total ← 0',
  '    FOR i from 0 to n minus 1',
  '        total ← total + |rows[i] minus i|',
  '    FOR j from 0 to n minus 1',
  '        total ← total + |cols[j] minus j|',
  '    RETURN total',
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

export const python = `def min_moves_to_peaceful_board(n, rooks):
    rows = sorted(r for r, _ in rooks)
    cols = sorted(c for _, c in rooks)
    total = 0
    for i in range(n):
        total += abs(rows[i] - i)
    for j in range(n):
        total += abs(cols[j] - j)
    return total


if __name__ == "__main__":
    import json, sys
    data = json.loads(sys.stdin.read())
    print(min_moves_to_peaceful_board(data["n"], data["rooks"]))
`

const PY_LINES = python.split('\n')
const L = s => { const n = code.findIndex(c => c.text.includes(s)) + 1; if (!n) throw new Error(`Missing pseudocode line: ${s}`); return n }
const P = s => { const n = PY_LINES.findIndex(l => l.includes(s)) + 1; if (!n) throw new Error(`Missing Python line: ${s}`); return n }

export const phases = [
  { id: 'read', label: 'Board', description: 'Place the rooks on the board.' },
  { id: 'sort', label: 'Sort', description: 'Sort the rook rows and columns.' },
  { id: 'row', label: 'Rows', description: 'Pay the distance each sorted row needs.' },
  { id: 'col', label: 'Columns', description: 'Pay the distance each sorted column needs.' },
  { id: 'done', label: 'Result', description: 'Report the total moves.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and rooks.')
  const { n, rooks } = input
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n is an integer from 1 to 8.')
  if (!Array.isArray(rooks) || rooks.length !== n) throw new Error('rooks lists exactly n [row, column] pairs.')
  for (const rook of rooks) {
    if (!Array.isArray(rook) || rook.length !== 2 || !rook.every(v => Number.isInteger(v) && v >= 0 && v < n)) {
      throw new Error('Each rook is a [row, column] pair inside the n by n board.')
    }
  }
  return { n, rooks: rooks.map(([r, c]) => [r, c]) }
}

export function buildTrace({ n, rooks }) {
  const frames = []
  const base = { n, rooks }
  frames.push({ ...base, phase: 'read', activeLine: L('FUNCTION'), pythonLine: P('def min_moves'), axis: null, rank: -1, rows: null, cols: null, total: 0, message: `${n} by ${n} board with ${n} rooks.` })
  const rows = rooks.map(([r]) => r).sort((a, b) => a - b)
  const cols = rooks.map(([, c]) => c).sort((a, b) => a - b)
  frames.push({ ...base, phase: 'sort', activeLine: L('rows ← sorted'), pythonLine: P('rows = sorted'), axis: null, rank: -1, rows, cols, total: 0, message: `Sorted rook rows: ${rows.join(', ')}. Sorted columns: ${cols.join(', ')}.` })
  let total = 0
  for (let i = 0; i < n; i++) {
    const d = Math.abs(rows[i] - i)
    total += d
    frames.push({ ...base, phase: 'row', activeLine: L('total ← total + |rows'), pythonLine: P('total += abs(rows'), axis: 'row', rank: i, rows, cols, distance: d, total, message: `Row rank ${i} is row ${rows[i]}; it needs ${d} move${d === 1 ? '' : 's'} to reach row ${i}.` })
  }
  for (let j = 0; j < n; j++) {
    const d = Math.abs(cols[j] - j)
    total += d
    frames.push({ ...base, phase: 'col', activeLine: L('total ← total + |cols'), pythonLine: P('total += abs(cols'), axis: 'col', rank: j, rows, cols, distance: d, total, message: `Column rank ${j} is column ${cols[j]}; it needs ${d} move${d === 1 ? '' : 's'} to reach column ${j}.` })
  }
  frames.push({ ...base, phase: 'done', activeLine: L('RETURN total'), pythonLine: P('return total'), axis: null, rank: -1, rows, cols, distance: 0, total, message: `Minimum total moves: ${total}.` })
  return { input: { n, rooks }, result: total, frames }
}
