export const code = `whether a knight can reach target from start using an even number of moves
  set start colour to the sum of its row and column, modulo 2
  set target colour to the sum of its row and column, modulo 2
  if the two colours are equal then return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const at = code.findIndex(c => c.text.includes(text))
  if (at < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return at + 1
}

export const python = `def even_knight_moves(start, target):
    start_colour = (start[0] + start[1]) % 2
    target_colour = (target[0] + target[1]) % 2
    if start_colour == target_colour:
        return True
    return False
`
const pyLines = python.split('\n')
const P = text => {
  const at = pyLines.findIndex(line => line.includes(text))
  if (at < 0) throw new Error(`Missing python line: ${text}`)
  return at + 1
}

const inside = v => Number.isInteger(v) && v >= 0 && v <= 7

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.start) || !Array.isArray(input.target)) throw new Error('Use an object with start and target as [row, column] pairs.')
  const { start, target } = input
  if (start.length !== 2 || target.length !== 2 || ![...start, ...target].every(inside)) {
    throw new Error('Each square is [row, column] with both values from 0 to 7.')
  }
  return { start, target }
}

export function buildTrace({ start, target }) {
  const frames = []
  const sc = (start[0] + start[1]) % 2
  frames.push({ pythonLine: P('start_colour = '), phase: 'start', activeLine: L('set start colour'), start, target, sc, tc: null, same: null, message: `Start ${start[0]},${start[1]} has colour ${sc}.` })
  const tc = (target[0] + target[1]) % 2
  frames.push({ pythonLine: P('target_colour = '), phase: 'target', activeLine: L('set target colour'), start, target, sc, tc, same: null, message: `Target ${target[0]},${target[1]} has colour ${tc}.` })
  const same = sc === tc
  frames.push({ pythonLine: P('if start_colour == target_colour'), phase: 'compare', activeLine: L('if the two colours are equal'), start, target, sc, tc, same,
    message: same ? 'Both squares share a colour, so an even walk exists.' : 'The colours differ, so every walk has odd length.' })
  frames.push({ pythonLine: P('return False') , phase: 'done', activeLine: L('return false'), start, target, sc, tc, same, result: same,
    message: same ? 'Answer: true.' : 'Answer: false.' })
  return { input: { start, target }, result: same, frames }
}
