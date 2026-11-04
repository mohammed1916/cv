// Teaching rule: from the king, walk outward along each of the eight directions; only the first queen on a ray can attack, because it blocks everything behind it.

export const phases = [
  { id: 'start', label: 'Board', description: 'Place the king and queens on the board. Each direction is a ray to walk.' },
  { id: 'ray', label: 'Ray', description: 'Start a ray from the king in one direction.' },
  { id: 'step', label: 'Step', description: 'Move one square outward and look for a queen.' },
  { id: 'hit', label: 'Attack', description: 'The first queen on this ray can attack the king. Farther queens are blocked.' },
  { id: 'done', label: 'Result', description: 'Return every attacking queen found.' },
]

const DIRECTIONS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"queens": [[0,1]], "king": [0,0]}.')
  const { queens, king } = input
  const cell = p => Array.isArray(p) && p.length === 2 && p.every(v => Number.isInteger(v) && v >= 0 && v < 8)
  if (!cell(king)) throw new Error('king must be a [row, column] pair with values from 0 to 7.')
  if (!Array.isArray(queens) || queens.length > 63 || !queens.every(cell)) throw new Error('queens is a list of up to 63 [row, column] pairs inside the board.')
  const keys = queens.map(q => q.join(','))
  if (new Set(keys).size !== keys.length) throw new Error('Queens must be on distinct squares.')
  if (keys.includes(king.join(','))) throw new Error('A queen cannot share the king square.')
  return { queens, king }
}

export function buildTrace({ queens, king }) {
  const frames = []
  const occupied = new Map(queens.map(([r, c]) => [`${r},${c}`, true]))
  const found = []
  frames.push({
    phase: 'start', activeLine: L('for (const [dr'), pythonLine: P('for dr, dc'),
    message: `The king sits at (${king[0]},${king[1]}). There are ${queens.length} queens; we walk eight rays outward from the king.`,
    snapshot: { king, direction: null, cell: null, found: [] },
  })
  for (const [dr, dc] of DIRECTIONS) {
    frames.push({
      phase: 'ray', activeLine: L('let r = king[0]'), pythonLine: P('r, c = king'),
      message: `Ray (${dr},${dc}): start from the king and step outward.`,
      snapshot: { king, direction: [dr, dc], cell: null, found: [...found] },
    })
    let r = king[0] + dr
    let c = king[1] + dc
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      if (occupied.has(`${r},${c}`)) {
        found.push([r, c])
        frames.push({
          phase: 'hit', activeLine: L('found.push'), pythonLine: P('append'),
          message: `The first queen on this ray is at (${r},${c}). It can attack the king, and queens beyond it are blocked.`,
          snapshot: { king, direction: [dr, dc], cell: [r, c], found: [...found] },
        })
        break
      }
      frames.push({
        phase: 'step', activeLine: L('while (r >= 0'), pythonLine: P('while 0 <= r'),
        message: `Square (${r},${c}) is empty, so the ray continues.`,
        snapshot: { king, direction: [dr, dc], cell: [r, c], found: [...found] },
      })
      r += dr
      c += dc
    }
  }
  frames.push({
    phase: 'done', activeLine: L('return found'), pythonLine: P('return found'),
    message: `${found.length} queen(s) can attack the king.`,
    snapshot: { king, direction: null, cell: null, found: [...found] },
  })
  return { input: { queens, king }, result: found, frames }
}

const codeLines = [
  "function queensAttackingKing(queens, king) {",
  "  const occupied = new Set(queens.map(([r, c]) => `${r},${c}`))",
  "  const found = []",
  "  for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {",
  "    let r = king[0] + dr",
  "    let c = king[1] + dc",
  "    while (r >= 0 && r < 8 && c >= 0 && c < 8) {",
  "      if (occupied.has(`${r},${c}`)) {",
  "        found.push([r, c])",
  "        break",
  "      }",
  "      r += dr",
  "      c += dc",
  "    }",
  "  }",
  "  return found",
  "}",
]
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

export const python = `def attacking_queens(queens, king):
    occupied = set(map(tuple, queens))
    found = []
    for dr, dc in [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]:
        r, c = king
        r, c = r + dr, c + dc
        while 0 <= r < 8 and 0 <= c < 8:
            if (r, c) in occupied:
                found.append([r, c])
                break
            r, c = r + dr, c + dc
    return found`

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
