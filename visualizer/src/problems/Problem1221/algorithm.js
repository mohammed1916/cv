// Teaching rule: a balance counter returns to zero exactly when a prefix is a complete balanced piece, and cutting there never blocks a later cut.

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with balance zero and no pieces.' },
  { id: 'scan', label: 'Scan', description: 'Read one letter and move the balance up for L or down for R.' },
  { id: 'cut', label: 'Cut', description: 'The balance is back at zero, so this section is a complete balanced piece.' },
  { id: 'done', label: 'Result', description: 'Return the number of pieces found.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"s": "LRLR"}.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 2 || s.length > 200) throw new Error('s must be a string of 2 to 200 letters.')
  if (!/^[LR]+$/.test(s)) throw new Error('s may contain only L and R.')
  const lefts = [...s].filter(c => c === 'L').length
  if (lefts * 2 !== s.length) throw new Error('The whole string must contain equal numbers of L and R.')
  return { s }
}

export function buildTrace({ s }) {
  const frames = []
  let balance = 0
  let pieces = 0
  let start = 0
  frames.push({
    phase: 'start', activeLine: L('balance = 0'), pythonLine: P('balance = 0'),
    message: 'Start with balance 0 and no pieces. Each L raises the balance and each R lowers it.',
    snapshot: { index: -1, balance, pieces, piece: '' },
  })
  for (let i = 0; i < s.length; i++) {
    balance += s[i] === 'L' ? 1 : -1
    frames.push({
      phase: 'scan', activeLine: L('balance += 1'), pythonLine: P('balance +='),
      message: `Letter ${i + 1} is ${s[i]}, so the balance becomes ${balance}.`,
      snapshot: { index: i, balance, pieces, piece: s.slice(start, i + 1) },
    })
    if (balance === 0) {
      pieces++
      frames.push({
        phase: 'cut', activeLine: L('pieces += 1'), pythonLine: P('pieces += 1'),
        message: `The balance returned to 0 after letter ${i + 1}, so ${s.slice(start, i + 1)} is a balanced piece. Pieces so far: ${pieces}.`,
        snapshot: { index: i, balance, pieces, piece: s.slice(start, i + 1) },
      })
      start = i + 1
    }
  }
  frames.push({
    phase: 'done', activeLine: L('return pieces'), pythonLine: P('return pieces'),
    message: `The string splits into ${pieces} balanced pieces.`,
    snapshot: { index: s.length - 1, balance, pieces, piece: '' },
  })
  return { input: { s }, result: pieces, frames }
}

const codeLines = `split a balanced string (s):
  balance = 0
  pieces = 0
  for each letter in s:
    if letter is L: balance += 1 else balance -= 1
    if balance == 0:
      pieces += 1
  return pieces`.split('\n')

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

export const python = `def split_balanced(s):
    balance = 0
    pieces = 0
    for ch in s:
        balance += 1 if ch == 'L' else -1
        if balance == 0:
            pieces += 1
    return pieces`

const pyLines = python.split('\n')
const L = s => {
  const i = codeLines.findIndex(t => t.includes(s))
  if (i < 0) throw new Error(`Missing code line: ${s}`)
  return i + 1
}
const P = s => {
  const i = pyLines.findIndex(t => t.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
