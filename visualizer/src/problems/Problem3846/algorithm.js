const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 40 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 40 lowercase letters.')
  return { s }
}

export const code = `total finger distance typing s on the keyboard
  position of each key: row and column in the three left-aligned rows
  row, col = position of 'a'
  total = 0
  for each letter ch in s
    nr, nc = position of ch
    total = total + |nr - row| + |nc - col|
    row, col = nr, nc
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing pseudocode: ${s}`); return i + 1 }

export const python = `def total_distance(s):
    rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
    where = {}
    for r, row in enumerate(rows):
        for c, ch in enumerate(row):
            where[ch] = (r, c)
    r, c = where["a"]
    total = 0
    for ch in s:
        nr, nc = where[ch]
        total += abs(nr - r) + abs(nc - c)
        r, c = nr, nc
    return total`
const PY = python.split('\n')
const Q = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing python: ${s}`); return i + 1 }

export function buildTrace({ s }) {
  const where = {}
  ROWS.forEach((row, r) => [...row].forEach((ch, c) => { where[ch] = [r, c] }))
  let [r, c] = where.a
  let total = 0
  const frames = []
  frames.push({ phase: 'start', from: [r, c], to: null, letter: null, step: 0, total, moves: [], pythonLine: Q('r, c = where["a"]'), activeLine: L('row, col = position of'), message: 'The finger rests on a, the first key of the middle row.' })
  const moves = []
  for (let idx = 0; idx < s.length; idx++) {
    const ch = s[idx]
    const [nr, nc] = where[ch]
    const d = Math.abs(nr - r) + Math.abs(nc - c)
    total += d
    moves.push({ ch, from: [r, c], to: [nr, nc], d })
    frames.push({ phase: 'move', from: [r, c], to: [nr, nc], letter: ch, step: idx + 1, distance: d, total, moves: moves.map(m => ({ ...m })), pythonLine: Q('total += abs(nr - r)'), activeLine: L('total = total + |nr - row|'), message: `${ch}: ${d} step${d === 1 ? '' : 's'} from the last key, running total ${total}.` })
    r = nr
    c = nc
  }
  frames.push({ phase: 'done', from: [r, c], to: null, letter: null, step: s.length, total, moves: moves.map(m => ({ ...m })), pythonLine: Q('return total'), activeLine: L('return total'), message: `Total distance for "${s}": ${total}.` })
  return { input: { s }, result: total, frames }
}
