// Concatenate pieces: each step looks up the piece whose first value is the current value of arr.
const JS_LINES = [
  { text: 'const byFirst = new Map(pieces.map(p => [p[0], p]))', py: 'by_first = {' },
  { text: 'let i = 0', py: 'i = 0' },
  { text: 'while (i < arr.length) {', py: 'while i < len(arr)' },
  { text: 'const piece = byFirst.get(arr[i])', py: 'piece = by_first.get' },
  { text: 'if (!piece || piece.some((v, k) => arr[i + k] !== v)) return false', py: 'if piece is None' },
  { text: 'i += piece.length', py: 'i += len(piece)' },
  { text: '}', py: null },
  { text: 'return true', py: 'return True' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def canFormArray(arr, pieces):
    by_first = {p[0]: p for p in pieces}
    i = 0
    while i < len(arr):
        piece = by_first.get(arr[i])
        if piece is None or arr[i:i + len(piece)] != piece:
            return False
        i += len(piece)
    return True
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return True')]))

export const phases = [
  { id: 'index', label: 'Index', description: 'Remember which piece starts with each value.' },
  { id: 'match', label: 'Match', description: 'The piece that starts at the current position must match arr exactly.' },
  { id: 'fail', label: 'No match', description: 'No piece starts here, or the values do not line up.' },
  { id: 'done', label: 'Result', description: 'Every position of arr was covered by a matching piece.' },
]

export const examples = [
  { label: 'Pieces in a different order', input: '{"arr":[6,2,9,4,8],"pieces":[[9,4],[6,2],[8]]}' },
  { label: 'No piece starts with 1', input: '{"arr":[1,3,5,7],"pieces":[[2,4,6,8]]}' },
  { label: 'Single piece', input: '{"arr":[3,1],"pieces":[[3,1]]}' },
]

export const complexity = 'O(n) time and O(n) space for arr of length n with all pieces together of length n.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.arr) || !Array.isArray(input.pieces)) throw new Error('Use an object with arr and pieces.')
  const { arr, pieces } = input
  if (arr.length < 1 || arr.length > 20) throw new Error('arr has 1 to 20 values (visual cap).')
  if (new Set(arr).size !== arr.length || !arr.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('arr holds distinct integers from 1 to 100.')
  if (pieces.length < 1 || pieces.some(p => !Array.isArray(p) || p.length < 1)) throw new Error('Each piece is a non-empty array.')
  const total = pieces.reduce((sum, p) => sum + p.length, 0)
  if (total !== arr.length) throw new Error('The pieces together have the same length as arr.')
  const firsts = pieces.map(p => p[0])
  if (new Set(firsts).size !== firsts.length) throw new Error('Pieces start with distinct values.')
  return { arr, pieces }
}

export function buildTrace({ arr, pieces }) {
  const frames = []
  const byFirst = new Map(pieces.map(p => [p[0], p]))
  const used = []
  let i = 0
  let result = true
  const snap = extra => ({ i, used: [...used], ...extra })
  frames.push({ phase: 'index', activeLine: 1, i: -1, message: `Pieces indexed by their first value: ${[...byFirst.keys()].join(', ')}.`, snapshot: snap({}) })
  while (i < arr.length) {
    const piece = byFirst.get(arr[i])
    if (!piece || piece.some((v, k) => arr[i + k] !== v)) {
      result = false
      frames.push({ phase: 'fail', activeLine: 5, i, message: `At position ${i} (value ${arr[i]}) no piece matches.`, snapshot: snap({}) })
      break
    }
    used.push(pieces.indexOf(piece))
    frames.push({ phase: 'match', activeLine: 4, i, piece, message: `Piece [${piece.join(', ')}] matches at position ${i}.`, snapshot: snap({}) })
    i += piece.length
    frames[frames.length - 1].snapshot.i = i
  }
  frames.push({ phase: 'done', activeLine: 8, i: -1, result, message: result ? 'Every position is covered: true.' : 'Not covered: false.', snapshot: snap({ result }) })
  return { input: { arr, pieces }, result, frames }
}
