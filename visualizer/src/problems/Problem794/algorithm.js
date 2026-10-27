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
  const frames = [{ ...base, phase: 'start', activeLine: 1, x: 0, o: 0, message: 'X moves first, so a real game must satisfy strict count and winner rules.' }]
  let result = true
  frames.push({ ...base, phase: 'count', activeLine: 1, message: `Count pieces: X = ${x}, O = ${o}.` })
  if (o > x || x > o + 1) {
    result = false
    frames.push({ ...base, phase: 'invalid', activeLine: 2, message: `X must have equal pieces or exactly one more than O (X moves first); ${x} vs ${o} is impossible.` })
  } else {
    const wx = win('X'), wo = win('O')
    frames.push({ ...base, phase: 'check', activeLine: 3, line: wx, message: wx ? `X has a winning line (${wx.join(',')}).` : 'X has no winning line.' })
    if (wx && x !== o + 1) {
      result = false
      frames.push({ ...base, phase: 'invalid', activeLine: 3, line: wx, message: 'X won, so the game ended right after an X move: X must have exactly one more piece than O.' })
    } else {
      frames.push({ ...base, phase: 'check', activeLine: 4, line: wo, message: wo ? `O has a winning line (${wo.join(',')}).` : 'O has no winning line.' })
      if (wo && x !== o) {
        result = false
        frames.push({ ...base, phase: 'invalid', activeLine: 4, line: wo, message: 'O won, so the game ended right after an O move: counts must be equal.' })
      }
    }
  }
  frames.push({ ...base, phase: 'done', activeLine: result ? 5 : o > x || x > o + 1 ? 2 : win('X') && x !== o + 1 ? 3 : 4, message: result ? 'All rules hold: the board is reachable.' : 'The board is not reachable in a valid game.' })
  return { input: board, result, frames }
}
export const code = `set cells to the nine cells read in order, x = count of X, o = count of O
if o is greater than x or x is greater than o + 1 then return False
if X has a winning line and x is not o + 1 then return False
if O has a winning line and x is not o then return False
return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def valid_tic_tac_toe(board):
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
    return True
`
