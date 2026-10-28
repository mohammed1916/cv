export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj.s !== 'string' || typeof obj.x !== 'string' || typeof obj.y !== 'string') throw new Error('Use an object with string fields s, x and y.')
  const { s, x, y } = obj
  if (s.length < 1 || s.length > 16) throw new Error('Use s with 1 to 16 letters for the visualization.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s must use lowercase letters a to z only.')
  if (!/^[a-z]$/.test(x) || !/^[a-z]$/.test(y)) throw new Error('x and y must each be one lowercase letter.')
  if (x === y) throw new Error('x and y must be different letters.')
  return { s, x, y }
}

export function buildTrace(input) {
  const { s, y } = input
  const frames = []
  const ys = []
  const others = []
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === y) {
      ys.push(c)
      frames.push({ phase: 'pick', activeLine: L('if c is y'), index: i, letter: c, message: `${c} goes to the front group, ahead of every x.` })
    } else {
      others.push(c)
      frames.push({ phase: 'keep', activeLine: L('otherwise append c'), index: i, letter: c, message: `${c} keeps its place in the rest of the string.` })
    }
  }
  const result = [...ys, ...others].join('')
  frames.push({ phase: 'done', activeLine: L('return the result'), index: -1, letter: null, message: `Rearranged string: ${result}.` })
  return { input, result, frames }
}

export const code = `rearrange string to avoid character pair(s, x, y)
  set ys and others to empty lists
  for each letter c in s in order do
    if c is y then append c to ys
    otherwise append c to others
  join ys followed by others
  return the result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def rearrange_string_to_avoid_pair(s, x, y):
    ys = [c for c in s if c == y]
    others = [c for c in s if c != y]
    return ''.join(ys + others)
`
