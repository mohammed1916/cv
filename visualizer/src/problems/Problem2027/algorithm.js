export const phases = [
  { id: 'start', label: 'Scan', description: 'Scan from the left; O characters need no move.' },
  { id: 'window', label: 'Window l to r', description: 'An X at l starts a move that converts the three characters from l to r = l + 2 at once.' },
  { id: 'skip', label: 'Jump past', description: 'After a move, the next X that is not yet converted starts a new window three positions later.' },
  { id: 'done', label: 'Result', description: 'Return how many moves were needed.' },
]

export const code = `function minimumMoves(s) {
  let moves = 0
  let i = 0
  while (i < s.length) {
    if (s[i] === 'X') {
      moves++
      i += 3
    } else {
      i++
    }
  }
  return moves
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_moves(s):
    moves = 0
    i = 0
    while i < len(s):
        if s[i] == 'X':
            moves += 1
            i += 3
        else:
            i += 1
    return moves
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"s":"XXOX"}.') }
  const s = obj?.s
  if (typeof s !== 'string' || s.length < 1 || s.length > 60 || !/^[XO]+$/.test(s)) throw new Error('s must be 1 to 60 characters, each X or O.')
  return s
}

export function buildTrace(s) {
  const frames = []
  let moves = 0
  let i = 0
  const add = (phase, c, p, message, l, r) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { s, l, r, moves },
  })
  add('start', 'let moves = 0', 'moves = 0', 'Start at the first character.', -1, -1)
  while (i < s.length) {
    if (s[i] === 'X') {
      const r = Math.min(s.length - 1, i + 2)
      add('window', "if (s[i] === 'X')", "if s[i] == 'X'", `X at ${i}: one move converts positions ${i} to ${r}.`, i, r)
      moves++
      i += 3
      add('skip', 'i += 3', 'i += 3', `${moves} move(s) so far; continue after position ${i - 1}.`, Math.min(i, s.length - 1), -1)
    } else {
      i++
    }
  }
  add('done', 'return moves', 'return moves', `Minimum moves: ${moves}.`, -1, -1)
  return { input: s, result: moves, frames }
}
