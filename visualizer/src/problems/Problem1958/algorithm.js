// LeetCode 1958: from the chosen cell, walk each of the eight directions over opposite-colour cells. The move is legal when that walk ends on a same-colour cell after at least one opposite cell.
const SOURCE = [
  "function checkMove(board, rMove, cMove, color) {",
  "  const opposite = color === 'W' ? 'B' : 'W'",
  "  for (const [dr, dc] of DIRECTIONS) {",
  "    let r = rMove + dr, c = cMove + dc, seen = 0",
  "    while (inside(r, c) && board[r][c] === opposite) { r += dr; c += dc; seen++ }",
  "    if (seen > 0 && inside(r, c) && board[r][c] === color) return true",
  "  }",
  "  return false",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def check_move(board, r_move, c_move, color):
    opposite = "B" if color == "W" else "W"
    for dr, dc in [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]:
        r, c, seen = r_move + dr, c_move + dc, 0
        while 0 <= r < 8 and 0 <= c < 8 and board[r][c] == opposite:
            r += dr
            c += dc
            seen += 1
        if seen > 0 and 0 <= r < 8 and 0 <= c < 8 and board[r][c] == color:
            return True
    return False
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8

export const phases = [
  { id: 'rays', label: 'Walk rays', description: 'Walk each direction over the opposite colour.' },
  { id: 'done', label: 'Result', description: 'Whether any ray closes the line.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON with board (8 strings of 8 characters), rMove, cMove and color.') }
  const { board, rMove, cMove, color } = input || {}
  if (!Array.isArray(board) || board.length !== 8 || !board.every(row => typeof row === 'string' && /^[.WB]{8}$/.test(row))) throw new Error('board is 8 rows of 8 characters from . W B.')
  if (!Number.isInteger(rMove) || !Number.isInteger(cMove) || !inside(rMove, cMove)) throw new Error('rMove and cMove are 0 to 7.')
  if (color !== 'W' && color !== 'B') throw new Error('color is W or B.')
  return { board, rMove, cMove, color }
}

export function buildTrace({ board, rMove, cMove, color }) {
  const opposite = color === 'W' ? 'B' : 'W'
  const frames = []
  let result = false
  for (const [dr, dc] of DIRS) {
    let r = rMove + dr, c = cMove + dc, seen = 0
    const ray = []
    while (inside(r, c) && board[r][c] === opposite) { ray.push([r, c]); r += dr; c += dc; seen++ }
    const closes = seen > 0 && inside(r, c) && board[r][c] === color
    if (closes) result = true
    frames.push({ phase: 'rays', activeLine: L(closes ? 'return true' : 'seen > 0 && inside'), pythonLine: P(closes ? 'return True' : 'if seen > 0'), message: closes ? `Direction (${dr}, ${dc}): ${seen} opposite cell(s) then a ${color} cell: legal.` : seen > 0 ? `Direction (${dr}, ${dc}): ${seen} opposite cell(s) but no closing ${color} cell.` : `Direction (${dr}, ${dc}): no opposite cell next to the move.`, dir: [dr, dc], ray, closes, cell: [rMove, cMove], result: null })
    if (closes) break
  }
  frames.push({ phase: 'done', activeLine: L(result ? 'return true' : 'return false'), pythonLine: P(result ? 'return True' : 'return False'), message: result ? 'The move is legal.' : 'No direction forms a good line, so the move is illegal.', dir: null, ray: [], closes: false, cell: [rMove, cMove], result })
  return { input: { board, rMove, cMove, color }, result, frames }
}
