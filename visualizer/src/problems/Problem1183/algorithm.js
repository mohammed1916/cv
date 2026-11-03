const INT = /^-?\d+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with width, height, sideLength and maxOnes.')
  const { width, height, sideLength, maxOnes } = input
  for (const [name, value, lo, hi] of [['width', width, 1, 12], ['height', height, 1, 12], ['sideLength', sideLength, 1, 6]]) {
    if (!Number.isInteger(value) || value < lo || value > hi) throw new Error(`${name} is an integer from ${lo} to ${hi}.`)
  }
  if (!Number.isInteger(maxOnes) || maxOnes < 0 || maxOnes > sideLength * sideLength) throw new Error(`maxOnes is an integer from 0 to sideLength squared.`)
  return { width, height, sideLength, maxOnes }
}

// Every board cell belongs to exactly one residue class (row mod S, column mod S).
// Every S by S window contains exactly one cell from each class, so a pattern that
// keeps K classes of ones gives every window exactly K ones. Greedy: keep the largest classes.
export function buildTrace({ width, height, sideLength: S, maxOnes: K }) {
  const frames = []
  const counts = Array.from({ length: S }, () => Array(S).fill(null))
  const emptyBoard = () => Array.from({ length: height }, () => Array(width).fill(0))
  const base = { counts: counts.map(r => r.slice()), picked: [], order: [], cur: null, total: 0, board: emptyBoard() }
  const push = (f) => frames.push({ ...base, counts: base.counts.map(r => r.slice()), picked: base.picked.slice(), order: base.order.slice(), board: base.board.map(r => r.slice()), ...f })

  push({ pythonLine: PY('counts = {}'), phase: 'start', activeLine: L('for each row r'), message: `Board ${width} wide by ${height} tall; every ${S} by ${S} window may hold at most ${K} ones.`, ok: null })

  if (S > Math.min(width, height)) {
    push({ pythonLine: PY('if side > min(width, height)'), phase: 'free', activeLine: L('if side is larger'), message: `No ${S} by ${S} window fits on this board, so no limit applies. Every cell can be a one.`, ok: true })
    const total = width * height
    base.board = Array.from({ length: height }, () => Array(width).fill(1))
    push({ pythonLine: PY('return width * height'), phase: 'done', activeLine: L('return width times height'), message: `Result: ${total}.`, total, ok: true })
    return { input: { width, height, sideLength: S, maxOnes: K }, result: total, frames }
  }

  const classCount = (r, c) => Math.ceil((height - r) / S) * Math.ceil((width - c) / S)
  for (let r = 0; r < S; r++) {
    for (let c = 0; c < S; c++) {
      counts[r][c] = classCount(r, c)
      base.counts = counts.map(row => row.slice())
      base.cur = [r, c]
      push({ pythonLine: PY('counts[(r, c)] ='), phase: 'count', activeLine: L('count the board cells whose row'), message: `Residue (${r}, ${c}) covers ${counts[r][c]} board cell${counts[r][c] === 1 ? '' : 's'}.`, ok: null })
    }
  }
  base.cur = null

  const order = []
  for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) order.push([r, c])
  order.sort((a, b) => counts[b[0]][b[1]] - counts[a[0]][a[1]] || a[0] - b[0] || a[1] - b[1])
  base.order = order.map(([r, c]) => `${r},${c}`)
  push({ pythonLine: PY('order = sorted(counts'), phase: 'sort', activeLine: L('sort the pattern cells'), message: `Rank residue classes by how many cells they cover, largest first.`, ok: null })

  let total = 0
  const picked = []
  const board = emptyBoard()
  for (let k = 0; k < Math.min(K, S * S); k++) {
    const [r, c] = order[k]
    total += counts[r][c]
    picked.push(`${r},${c}`)
    base.cur = [r, c]
    for (let i = r; i < height; i += S) for (let j = c; j < width; j += S) board[i][j] = 1
    base.board = board.map(row => row.slice())
    base.picked = picked.slice()
    base.total = total
    push({ pythonLine: PY('for k in order[:max_ones]'), phase: 'pick', activeLine: L('for the first maxOnes cells'), message: `Keep residue (${r}, ${c}) as ones: +${counts[r][c]}, running total ${total}.`, ok: true })
  }
  base.cur = null
  push({ pythonLine: PY('return total'), phase: 'done', activeLine: L('return total'), message: `Best total is ${total} with ${picked.length} class${picked.length === 1 ? '' : 'es'} kept.`, total, ok: true })
  return { input: { width, height, sideLength: S, maxOnes: K }, result: total, frames }
}

export const code = `max ones on a width by height board, each side by side window holding at most maxOnes ones
if side is larger than width or height then return width times height
for each row r and column c of the side by side pattern
  count the board cells whose row mod side is r and column mod side is c
sort the pattern cells by count, largest first
total = 0
for the first maxOnes cells in that order
  add its count to total and mark its cells as ones
return total`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_ones(width, height, side, max_ones):
    if side > min(width, height):
        return width * height
    counts = {}
    for r in range(side):
        for c in range(side):
            counts[(r, c)] = len(range(r, height, side)) * len(range(c, width, side))
    order = sorted(counts, key=lambda k: (-counts[k], k))
    total = 0
    for k in order[:max_ones]:
        total += counts[k]
    return total
`

function PY(s) {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Setup', description: 'Read the board and the window rule.' },
  { id: 'free', label: 'Unconstrained', description: 'No full window fits, so nothing limits the board.' },
  { id: 'count', label: 'Count', description: 'Count the board cells in each residue class.' },
  { id: 'sort', label: 'Rank', description: 'Order the residue classes from largest to smallest.' },
  { id: 'pick', label: 'Keep', description: 'Spend one allowed one on the next largest class.' },
  { id: 'done', label: 'Result', description: 'Report the best total.' },
]
