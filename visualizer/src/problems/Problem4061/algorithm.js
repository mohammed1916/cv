// On an empty board a queen reaches a square in one move when it shares a row, column or diagonal.
// Otherwise two moves always suffice: some pivot square is on a line with both endpoints.

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with source and target squares.')
  const { source, target } = input
  for (const square of [source, target]) {
    if (!Array.isArray(square) || square.length !== 2 || !square.every(v => Number.isInteger(v) && v >= 1 && v <= 8)) {
      throw new Error('Each square is [row, column] with values from 1 to 8.')
    }
  }
  return { source, target }
}

export function oneMove(a, b) {
  const dr = b[0] - a[0]
  const dc = b[1] - a[1]
  return (dr !== 0 || dc !== 0) && (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))
}

export function buildTrace({ source, target }) {
  const frames = []
  const base = { source, target, pivot: null, lines: null }
  frames.push({
    phase: 'start', activeLine: L('IF source equals target'), pythonLine: P('if source == target'),
    ...base, result: null, message: `Queen starts at ${source.join(',')} and must reach ${target.join(',')}.`,
  })
  if (source[0] === target[0] && source[1] === target[1]) {
    frames.push({ phase: 'same', activeLine: L('RETURN 0'), pythonLine: P('return 0'), ...base, result: 0, message: 'Both squares are the same, so no move is needed.' })
    return { input: { source, target }, result: 0, frames }
  }
  const sameLine = oneMove(source, target)
  const lines = sameLine ? 'row, column or diagonal' : null
  frames.push({
    phase: 'line', activeLine: L('IF source and target share'), pythonLine: P('if one_move(source, target)'),
    ...base, lines, result: null,
    message: sameLine ? 'The target sits on a row, column or diagonal of the source.' : 'No shared row, column or diagonal, so one move is impossible.',
  })
  if (sameLine) {
    frames.push({ phase: 'done', activeLine: L('RETURN 1'), pythonLine: P('return 1'), ...base, lines, result: 1, message: 'One queen move reaches the target.' })
    return { input: { source, target }, result: 1, frames }
  }
  let pivot = null
  for (let r = 1; r <= 8 && !pivot; r++) {
    for (let c = 1; c <= 8 && !pivot; c++) {
      if (oneMove(source, [r, c]) && oneMove([r, c], target)) pivot = [r, c]
    }
  }
  if (!pivot) throw new Error('No pivot found on an 8 by 8 board')
  frames.push({
    phase: 'pivot', activeLine: L('FOR each square pivot'), pythonLine: P('for r in range(1, 9)'),
    source, target, pivot, lines: null, result: null,
    message: `Pivot ${pivot.join(',')} shares a line with the source and with the target.`,
  })
  frames.push({ phase: 'done', activeLine: L('RETURN 2'), pythonLine: P('return 2'), source, target, pivot, lines: null, result: 2, message: 'Two queen moves reach the target through the pivot.' })
  return { input: { source, target }, result: 2, frames }
}

export const code = `FUNCTION queenMoves(source, target)
    IF source equals target THEN RETURN 0
    IF source and target share a row, column or diagonal THEN RETURN 1
    FOR each square pivot on the board
        IF pivot is one queen move from source AND one queen move from target THEN RETURN 2
    RETURN -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def one_move(a, b):
    dr = b[0] - a[0]
    dc = b[1] - a[1]
    return (dr != 0 or dc != 0) and (dr == 0 or dc == 0 or abs(dr) == abs(dc))


def queen_moves(source, target):
    if source == target:
        return 0
    if one_move(source, target):
        return 1
    for r in range(1, 9):
        for c in range(1, 9):
            pivot = (r, c)
            if one_move(source, pivot) and one_move(pivot, target):
                return 2
    return -1


if __name__ == "__main__":
    import json
    import sys
    data = json.loads(sys.stdin.read())
    print(queen_moves(tuple(data["source"]), tuple(data["target"])))
`
