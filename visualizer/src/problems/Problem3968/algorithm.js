export const code = `count the fixed moves into x and y, and count the underscores
choose the underscore direction along x, away from zero, positive when x is zero
walk the string, letting every underscore move x in that direction
return the absolute value of x plus the absolute value of y`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_manhattan_distance(moves):
    x = y = blanks = 0
    for ch in moves:
        if ch == 'R':
            x += 1
        elif ch == 'L':
            x -= 1
        elif ch == 'U':
            y += 1
        elif ch == 'D':
            y -= 1
        else:
            blanks += 1
    sign = 1 if x >= 0 else -1
    return abs(x + sign * blanks) + abs(y)
`

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
  const moves = text.trim()
  if (moves.length < 1 || moves.length > 30) throw new Error('Use 1 to 30 characters.')
  if (!/^[UDLR_]+$/.test(moves)) throw new Error('Use only U, D, L, R and underscore.')
  return moves
}

export function buildTrace(moves) {
  const frames = []
  let x = 0
  let y = 0
  let blanks = 0
  for (const ch of moves) {
    if (ch === 'R') x++
    else if (ch === 'L') x--
    else if (ch === 'U') y++
    else if (ch === 'D') y--
    else blanks++
  }
  frames.push({ phase: 'count', activeLine: L('count the fixed moves'), pythonLine: P('x = y = blanks = 0'), index: -1, ch: null, x, y, blanks, sign: null, message: `Fixed moves give x = ${x}, y = ${y}; there are ${blanks} underscores.` })
  const sign = x >= 0 ? 1 : -1
  frames.push({ phase: 'sign', activeLine: L('choose the underscore direction'), pythonLine: P('sign = 1 if x >= 0'), index: -1, ch: null, x, y, blanks, sign, message: `Underscores move x ${sign > 0 ? 'right' : 'left'}, away from zero, so each adds one to |x| or |y| that cannot be undone.` })
  let px = 0
  let py = 0
  moves.split('').forEach((ch, index) => {
    let used = ch
    if (ch === 'R') px++
    else if (ch === 'L') px--
    else if (ch === 'U') py++
    else if (ch === 'D') py--
    else { used = sign > 0 ? 'R' : 'L'; px += sign }
    frames.push({ phase: 'walk', activeLine: L('walk the string'), pythonLine: P('for ch in moves'), index, ch, used, x: px, y: py, blanks, sign, message: ch === '_' ? `Underscore at ${index} moves ${used}; position (${px}, ${py}).` : `Move ${ch} at ${index}; position (${px}, ${py}).` })
  })
  const result = Math.abs(px) + Math.abs(py)
  frames.push({ phase: 'done', activeLine: L('return the absolute value of x'), pythonLine: P('return abs'), index: -1, ch: null, x: px, y: py, blanks, sign, result, message: `Final distance |${px}| + |${py}| = ${result}.` })
  return { input: moves, result, frames }
}
