export const phases = [
  { id: 'index', label: 'Index pieces', description: 'Each piece is keyed by its first value. Values are distinct, so each key picks one piece.' },
  { id: 'walk', label: 'Walk arr', description: 'Read arr from the left. The value at the current position must start a piece.' },
  { id: 'match', label: 'Compare piece', description: 'The whole piece must match arr at this position, in its own order.' },
  { id: 'advance', label: 'Advance', description: 'Skip past the matched piece and continue from the next position.' },
  { id: 'done', label: 'Decide', description: 'True when every position of arr has been covered by a matched piece.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.arr) || !Array.isArray(data.pieces)) {
    throw new Error('Enter a JSON object with "arr" (array) and "pieces" (array of arrays).')
  }
  const { arr, pieces } = data
  const isInt = v => Number.isInteger(v) && Math.abs(v) <= 100
  if (arr.length < 1 || arr.length > 12 || !arr.every(isInt)) throw new Error('arr must hold 1–12 integers from −100 to 100.')
  if (new Set(arr).size !== arr.length) throw new Error('arr values must be distinct.')
  if (pieces.length < 1 || pieces.length > 12) throw new Error('Give 1–12 pieces.')
  if (!pieces.every(p => Array.isArray(p) && p.length > 0 && p.every(isInt))) throw new Error('Each piece must be a non-empty array of integers.')
  const flat = pieces.flat()
  if (new Set(flat).size !== flat.length) throw new Error('Values across all pieces must be distinct.')
  const inArr = new Set(arr)
  if (!flat.every(v => inArr.has(v)) || flat.length !== arr.length) throw new Error('Pieces must use exactly the values of arr, each once.')
  return { arr, pieces }
}

export function buildTrace({ arr, pieces }) {
  const frames = []
  const byFirst = new Map(pieces.map((p, idx) => [p[0], idx]))
  const snap = extra => ({ arr: [...arr], pieces: pieces.map(p => [...p]), i: null, piece: null, matched: 0, used: [], ...extra })
  frames.push({
    phase: 'index', activeLine: 2,
    message: `Key each piece by its first value: ${[...byFirst.keys()].join(', ')}.`,
    snapshot: snap({}),
  })

  let i = 0
  const used = []
  let result = true
  while (i < arr.length) {
    frames.push({ phase: 'walk', activeLine: 4, message: `Position ${i} holds ${arr[i]}. Look for the piece that starts with it.`, snapshot: snap({ i, used: [...used] }) })
    const pIdx = byFirst.get(arr[i])
    if (pIdx === undefined) {
      frames.push({ phase: 'match', activeLine: 7, message: `No piece starts with ${arr[i]}, so arr cannot be formed. Stop.`, snapshot: snap({ i, used: [...used] }) })
      result = false
      break
    }
    const piece = pieces[pIdx]
    let matched = 0
    while (matched < piece.length && arr[i + matched] === piece[matched]) matched++
    if (matched < piece.length) {
      frames.push({
        phase: 'match', activeLine: 7,
        message: `Piece ${piece.join(', ')} needs ${piece[matched]} at position ${i + matched}, but arr has ${arr[i + matched] ?? 'nothing'}. Stop.`,
        snapshot: snap({ i, piece: pIdx, matched, used: [...used] }),
      })
      result = false
      break
    }
    frames.push({
      phase: 'match', activeLine: 6,
      message: `Piece ${piece.join(', ')} matches arr from position ${i}.`,
      snapshot: snap({ i, piece: pIdx, matched, used: [...used] }),
    })
    used.push(pIdx)
    i += piece.length
    frames.push({
      phase: 'advance', activeLine: 8,
      message: i < arr.length ? `Continue from position ${i}.` : `All ${arr.length} positions are covered.`,
      snapshot: snap({ i, piece: pIdx, matched, used: [...used] }),
    })
  }
  frames.push({
    phase: 'done', activeLine: 9,
    message: result ? 'Return True: arr is a concatenation of the pieces in some order.' : 'Return False: no order of the pieces gives arr.',
    snapshot: snap({ i, used: [...used], result }),
  })
  return { input: { arr, pieces }, result, frames }
}

const LINES = [
  'def can_form_array(arr, pieces):',
  '    by_first = {p[0]: p for p in pieces}',
  '    i = 0',
  '    while i < len(arr):',
  '        piece = by_first.get(arr[i])',
  '        if piece is None or arr[i:i + len(piece)] != piece:',
  '            return False',
  '        i += len(piece)',
  '    return True',
]
export const code = LINES.map((text, index) => ({ line: index + 1, text }))
export const python = LINES.join('\n')
export const pythonLineMap = Object.fromEntries(LINES.map((_, i) => [i + 1, i + 1]))
