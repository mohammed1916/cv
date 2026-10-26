export const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
export function parseInput(text) {
  const b = JSON.parse(text)
  const err = 'Enter a JSON array of 3 strings, each exactly 3 characters from space, X and O, e.g. ["XOX"," X ","   "].'
  if (!Array.isArray(b) || b.length !== 3 || !b.every(r => typeof r === 'string' && /^[XO ]{3}$/.test(r))) throw new Error(err)
  return b
}
export function buildTrace(board) {
  const cells = board.join('')
  const x = [...cells].filter(c => c === 'X').length
  const o = [...cells].filter(c => c === 'O').length
  const win = p => LINES.find(l => l.every(i => cells[i] === p)) || null
  const base = { cells: [...cells], x, o, line: null }
  const frames = [{ ...base, phase: 'start', activeLine: 2, x: 0, o: 0, message: 'X moves first, so a real game must satisfy strict count and winner rules.' }]
  let result = true
  frames.push({ ...base, phase: 'count', activeLine: 3, message: `Count pieces: X = ${x}, O = ${o}.` })
  if (o > x || x > o + 1) {
    result = false
    frames.push({ ...base, phase: 'invalid', activeLine: 8, message: `X must have equal pieces or exactly one more than O (X moves first); ${x} vs ${o} is impossible.` })
  } else {
    const wx = win('X'), wo = win('O')
    frames.push({ ...base, phase: 'check', activeLine: 9, line: wx, message: wx ? `X has a winning line (${wx.join(',')}).` : 'X has no winning line.' })
    if (wx && x !== o + 1) {
      result = false
      frames.push({ ...base, phase: 'invalid', activeLine: 10, line: wx, message: 'X won, so the game ended right after an X move: X must have exactly one more piece than O.' })
    } else {
      frames.push({ ...base, phase: 'check', activeLine: 11, line: wo, message: wo ? `O has a winning line (${wo.join(',')}).` : 'O has no winning line.' })
      if (wo && x !== o) {
        result = false
        frames.push({ ...base, phase: 'invalid', activeLine: 12, line: wo, message: 'O won, so the game ended right after an O move: counts must be equal.' })
      }
    }
  }
  frames.push({ ...base, phase: 'done', activeLine: result ? 13 : 8, message: result ? 'All rules hold: the board is reachable.' : 'The board is not reachable in a valid game.' })
  return { input: board, result, frames }
}
export const code = `def validTicTacToe(board):
    cells = "".join(board)
    x, o = cells.count("X"), cells.count("O")
    lines = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]
    def wins(p):
        return any(all(cells[i] == p for i in line) for line in lines)
    if o > x or x > o + 1:
        return False
    if wins("X") and x != o + 1:
        return False
    if wins("O") and x != o:
        return False
    return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
