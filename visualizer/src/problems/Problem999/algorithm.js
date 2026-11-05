// Send a ray from the rook in each of the four directions. A ray passes over empty squares, stops at the first
// piece it meets, and counts that piece only if it is a black pawn. The rook cannot see past any piece.
export const code = String.raw`function rookCaptures(board) {
  let r0 = -1, c0 = -1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === 'R') { r0 = r; c0 = c; }
    }
  }
  let captures = 0;
  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    let r = r0 + dr, c = c0 + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const cell = board[r][c];
      if (cell === 'p') { captures++; break; } // the first piece is a black pawn: it can be captured
      if (cell !== '.') break; // a bishop blocks this direction
      r += dr;
      c += dc;
    }
  }
  return captures;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def rook_captures(board):
    r0, c0 = next((r, c) for r in range(8) for c in range(8) if board[r][c] == "R")
    captures = 0
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        r, c = r0 + dr, c0 + dc
        while 0 <= r < 8 and 0 <= c < 8:
            cell = board[r][c]
            if cell == "p":
                captures += 1  # the first piece is a black pawn: it can be captured
                break
            if cell != ".":
                break  # a bishop blocks this direction
            r += dr
            c += dc
    return captures`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'ray', label: 'Rays', description: 'Walk outward from the rook in one direction until a piece or the edge.' },
  { id: 'done', label: 'Total', description: 'Captures across all four directions.' },
]

const DIRECTIONS = [['down', 1, 0], ['up', -1, 0], ['right', 0, 1], ['left', 0, -1]]

export function parseInput(text) {
  const input = JSON.parse(text)
  const board = input && input.board
  if (!Array.isArray(board) || board.length !== 8) throw new Error('Use board: eight strings of eight characters each.')
  for (const row of board) {
    if (typeof row !== 'string' || row.length !== 8 || /[^.RBp]/.test(row)) {
      throw new Error('Each row must have eight characters from . (empty), R (rook), B (bishop) and p (pawn).')
    }
  }
  const rooks = board.join('').split('R').length - 1
  if (rooks !== 1) throw new Error('The board needs exactly one rook, R.')
  return { board }
}

export function buildTrace({ board }) {
  let r0 = -1, c0 = -1
  board.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'R') { r0 = r; c0 = c } }))
  let captures = 0
  const frames = []
  for (const [name, dr, dc] of DIRECTIONS) {
    const ray = []
    let r = r0 + dr, c = c0 + dc
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const cell = board[r][c]
      if (cell === 'p') {
        captures++
        ray.push([r, c])
        frames.push({ phase: 'ray', activeLine: L('captures++'), pythonLine: PY('captures += 1'), direction: name, ray: [...ray], stop: [r, c], outcome: 'pawn', captures,
          message: `Going ${name}, the first piece is a black pawn at (${r},${c}). It can be captured: total ${captures}.` })
        break
      }
      if (cell !== '.') {
        frames.push({ phase: 'ray', activeLine: L('a bishop blocks'), pythonLine: PY('a bishop blocks'), direction: name, ray: [...ray], stop: [r, c], outcome: 'blocked', captures,
          message: `Going ${name}, the first piece is a ${cell === 'B' ? 'bishop' : 'piece'} at (${r},${c}). It blocks the way, so nothing more is counted here.` })
        break
      }
      ray.push([r, c])
      r += dr
      c += dc
    }
    if (r < 0 || r >= 8 || c < 0 || c >= 8) {
      frames.push({ phase: 'ray', activeLine: L('while (r >= 0'), pythonLine: PY('while 0 <= r < 8'), direction: name, ray: [...ray], stop: null, outcome: 'edge', captures,
        message: `Going ${name}, the ray reaches the edge of the board with no piece in the way.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return captures'), pythonLine: PY('return captures'), direction: null, ray: [], stop: null, outcome: null, captures,
    message: `The rook can capture ${captures} pawn(s).` })
  return { input: { board }, result: captures, frames, rook: [r0, c0] }
}
