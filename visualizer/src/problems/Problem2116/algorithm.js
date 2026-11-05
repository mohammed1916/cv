// LeetCode 2116: Check if a Parentheses String Can Be Valid.
// Track the lowest and highest possible open-bracket balance over all fill-ins of unlocked positions.
// Unlocked positions widen the range by one in each direction; the string is valid if the lowest balance
// can reach zero while the highest never drops below zero.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"s":"))()","locked":"1100"}.') }
  const { s, locked } = data ?? {}
  if (typeof s !== 'string' || typeof locked !== 'string' || s.length !== locked.length || s.length < 1 || s.length > 20) {
    throw new Error('s and locked must be strings of equal length from 1 to 20.')
  }
  if (!/^[()]+$/.test(s) || !/^[01]+$/.test(locked)) throw new Error('s holds only ( and ), locked holds only 0 and 1.')
  return { s, locked }
}

export const code = `function canBeValid(s, locked) {
  if (s.length % 2 === 1) return false
  let lo = 0
  let hi = 0
  for (let i = 0; i < s.length; i++) {
    if (locked[i] === '0') {
      lo -= 1
      hi += 1
    } else if (s[i] === '(') {
      lo += 1
      hi += 1
    } else {
      lo -= 1
      hi -= 1
    }
    if (hi < 0) return false
    lo = Math.max(lo, 0)
  }
  return lo === 0
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: can_be_valid
def can_be_valid(s, locked):
    if len(s) % 2 == 1:
        return False
    lo = 0
    hi = 0
    for i in range(len(s)):
        if locked[i] == "0":
            lo -= 1
            hi += 1
        elif s[i] == "(":
            lo += 1
            hi += 1
        else:
            lo -= 1
            hi -= 1
        if hi < 0:
            return False
        lo = max(lo, 0)
    return lo == 0
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

export const phases = [
  { id: 'start', label: 'Odd length', description: 'An odd-length string can never be balanced.' },
  { id: 'step', label: 'Read character', description: 'Fixed brackets move the range; unlocked ones widen it.' },
  { id: 'reject', label: 'Too many closes', description: 'The highest possible balance dropped below zero.' },
  { id: 'done', label: 'Result', description: 'The lowest balance must end at zero.' },
]

export function buildTrace({ s, locked }) {
  const frames = []
  const rows = []
  let lo = 0
  let hi = 0
  const finish = (valid) => valid
  if (s.length % 2 === 1) {
    frames.push({ phase: 'start', activeLine: L('if (s.length % 2'), pythonLine: P('if len(s) % 2'), message: 'The length is odd, so no fill-in can balance it.', i: -1, rows, lo, hi, result: false })
    return { input: { s, locked }, result: false, frames }
  }
  frames.push({ phase: 'start', activeLine: L('let lo = 0'), pythonLine: P('lo = 0'), message: 'Start with balance 0 exactly.', i: -1, rows, lo, hi, result: null })
  let valid = null
  for (let i = 0; i < s.length && valid === null; i++) {
    if (locked[i] === '0') { lo -= 1; hi += 1 }
    else if (s[i] === '(') { lo += 1; hi += 1 }
    else { lo -= 1; hi -= 1 }
    if (hi < 0) {
      rows.push({ index: i, char: s[i], locked: locked[i], lo, hi, note: 'too many closes' })
      frames.push({ phase: 'reject', activeLine: L('if (hi < 0)'), pythonLine: P('if hi < 0'), message: `At index ${i} even the most open choice is negative, so the string cannot be valid.`, i, rows: [...rows], lo, hi, result: false })
      valid = false
      break
    }
    lo = Math.max(lo, 0)
    rows.push({ index: i, char: s[i], locked: locked[i], lo, hi, note: locked[i] === '0' ? 'free' : 'fixed' })
    frames.push({ phase: 'step', activeLine: L('lo = Math.max'), pythonLine: P('lo = max'), message: `Index ${i} (${locked[i] === '0' ? 'free' : 'fixed'} ${s[i]}): balance can be ${lo} to ${hi}.`, i, rows: [...rows], lo, hi, result: null })
  }
  if (valid === null) valid = finish(lo === 0)
  frames.push({ phase: 'done', activeLine: L('return lo === 0'), pythonLine: P('return lo == 0'), message: valid ? 'The lowest balance ends at 0, so a valid fill-in exists.' : 'The lowest balance does not reach 0 at the end.', i: s.length, rows: [...rows], lo, hi, result: valid })
  return { input: { s, locked }, result: valid, frames }
}
