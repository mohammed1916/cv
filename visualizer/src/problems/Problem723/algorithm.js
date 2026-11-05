export function parseInput(text) {
  const board = JSON.parse(text)
  if (!Array.isArray(board) || board.length < 1 || board.length > 8) throw new Error('Use 1 to 8 rows.')
  const width = board[0]?.length ?? 0
  if (width < 1 || width > 8 || board.some(row => !Array.isArray(row) || row.length !== width || row.some(v => !Number.isInteger(v) || v < 0 || v > 5))) {
    throw new Error('Use a rectangular board of integers 0 to 5 (0 = empty), at most 8 by 8.')
  }
  return board
}

const JS_LINES = [
  'function candyCrush(board) {',
  '  let grid = board.map(row => [...row])',
  '  for (;;) {',
  '    const crushed = new Set() // cells that belong to a run of three or more equal candies',
  '    for (let r = 0; r < grid.length; r++) {',
  '      for (let c = 0; c < grid[0].length; c++) {',
  '        const v = grid[r][c]',
  '        if (v === 0) continue',
  '        if (c + 2 < grid[0].length && grid[r][c + 1] === v && grid[r][c + 2] === v) mark(crushed, r, c, 0, 1)',
  '        if (r + 2 < grid.length && grid[r + 1][c] === v && grid[r + 2][c] === v) mark(crushed, r, c, 1, 0)',
  '      }',
  '    }',
  '    if (crushed.size === 0) break // stable: nothing else can be crushed',
  '    for (const key of crushed) { const [r, c] = key.split(\',\').map(Number); grid[r][c] = 0 } // set each cell in crushed to empty',
  '    grid = gravity(grid) // candies fall to the bottom of each column',
  '  }',
  '  return grid // return the board',
  '}',
]
const PY_LINES = [
  'def candy_crush(board):',
  '    grid = [row[:] for row in board]',
  '    while True:',
  '        crushed = set()',
  '        for r in range(len(grid)):',
  '            for c in range(len(grid[0])):',
  '                v = grid[r][c]',
  '                if v == 0:',
  '                    continue',
  '                if c + 2 < len(grid[0]) and grid[r][c + 1] == v and grid[r][c + 2] == v:',
  '                    crushed.update({(r, c), (r, c + 1), (r, c + 2)})',
  '                if r + 2 < len(grid) and grid[r + 1][c] == v and grid[r + 2][c] == v:',
  '                    crushed.update({(r, c), (r + 1, c), (r + 2, c)})',
  '        if not crushed:',
  '            break',
  '        for r, c in crushed:',
  '            grid[r][c] = 0',
  '        grid = gravity(grid)',
  '    return grid',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

const copy = board => board.map(row => [...row])

// Every run of three or more equal non-zero candies is marked, horizontally or vertically (a run of four marks four cells).
function crushable(board) {
  const rows = board.length, cols = board[0].length
  const marked = new Set()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = board[r][c]
      if (!v) continue
      if (c + 2 < cols && board[r][c + 1] === v && board[r][c + 2] === v) for (let k = 0; k < 3; k++) marked.add(`${r},${c + k}`)
      if (r + 2 < rows && board[r + 1][c] === v && board[r + 2][c] === v) for (let k = 0; k < 3; k++) marked.add(`${r + k},${c}`)
    }
  }
  return [...marked].map(key => key.split(',').map(Number))
}

// Candies keep their order and fall to the bottom of each column.
function gravity(board) {
  const rows = board.length, cols = board[0].length
  const out = Array.from({ length: rows }, () => Array(cols).fill(0))
  for (let c = 0; c < cols; c++) {
    const column = board.map(row => row[c]).filter(v => v !== 0)
    column.forEach((v, i) => { out[rows - column.length + i][c] = v })
  }
  return out
}

export function buildTrace(start) {
  let board = copy(start)
  const frames = [{ phase: 'start', board: copy(board), crushed: [], round: 0, activeLine: L('let grid'), pythonLine: P('grid = [row'), message: 'Look for three or more equal candies in a row or column.' }]
  let round = 0
  for (;;) {
    const crushed = crushable(board)
    if (crushed.length === 0) break
    round++
    frames.push({ phase: 'mark', board: copy(board), crushed, round, activeLine: L('const crushed = new Set'), pythonLine: P('crushed = set()'), message: `Round ${round}: ${crushed.length} candies sit in a run of three and are marked.` })
    for (const [r, c] of crushed) board[r][c] = 0
    frames.push({ phase: 'clear', board: copy(board), crushed: [], round, activeLine: L('set each cell in crushed'), pythonLine: P('grid[r][c] = 0'), message: 'Marked cells become empty.' })
    board = gravity(board)
    frames.push({ phase: 'drop', board: copy(board), crushed: [], round, activeLine: L('candies fall to the bottom'), pythonLine: P('grid = gravity'), message: 'Candies above fall into the empty cells below them.' })
  }
  frames.push({ phase: 'done', board: copy(board), crushed: [], round, result: board, activeLine: L('return grid'), pythonLine: P('return grid'), message: `Stable after ${round} round${round === 1 ? '' : 's'}.` })
  return { input: start, result: board, frames }
}
