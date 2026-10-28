const KINDS = ['rook', 'queen', 'bishop']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.pieces) || !Array.isArray(input.positions)) throw new Error('Use {"pieces": [...], "positions": [[r, c], ...]}.')
  const { pieces, positions } = input
  if (pieces.length < 1 || pieces.length > 3 || positions.length !== pieces.length) throw new Error('Use 1 to 3 pieces, each with one position.')
  if (pieces.some(p => !KINDS.includes(p))) throw new Error('Pieces are "rook", "queen" or "bishop".')
  if (positions.some(p => !Array.isArray(p) || p.length !== 2 || !Number.isInteger(p[0]) || !Number.isInteger(p[1]) || p[0] < 1 || p[0] > 8 || p[1] < 1 || p[1] > 8)) throw new Error('Each position is [row, column] from 1 to 8.')
  const keys = positions.map(p => p.join(','))
  if (new Set(keys).size !== keys.length) throw new Error('Pieces start on different squares.')
  return { pieces, positions }
}

// Squares a piece can reach in one move, including its own square (staying put).
function destinations(kind, [r, c]) {
  const result = [[r, c]]
  const dirs = []
  if (kind === 'rook' || kind === 'queen') dirs.push([1, 0], [-1, 0], [0, 1], [0, -1])
  if (kind === 'bishop' || kind === 'queen') dirs.push([1, 1], [1, -1], [-1, 1], [-1, -1])
  for (const [dr, dc] of dirs) {
    for (let k = 1; r + dr * k >= 1 && r + dr * k <= 8 && c + dc * k >= 1 && c + dc * k <= 8; k++) result.push([r + dr * k, c + dc * k])
  }
  return result
}

const sign = x => (x > 0) - (x < 0)
const distance = (start, dest) => Math.max(Math.abs(dest[0] - start[0]), Math.abs(dest[1] - start[1]))

// Where a piece is after t seconds: one square per second toward its destination, then it stays there.
function positionAt(start, dest, t) {
  const k = Math.min(t, distance(start, dest))
  return [start[0] + sign(dest[0] - start[0]) * k, start[1] + sign(dest[1] - start[1]) * k]
}

// Two moves clash when both pieces stand on the same square at the same second.
function clash(a, b) {
  const horizon = Math.max(distance(a.start, a.dest), distance(b.start, b.dest))
  for (let t = 0; t <= horizon; t++) {
    const p = positionAt(a.start, a.dest, t)
    const q = positionAt(b.start, b.dest, t)
    if (p[0] === q[0] && p[1] === q[1]) return true
  }
  return false
}

export function buildTrace({ pieces, positions }) {
  const options = pieces.map((kind, i) => destinations(kind, positions[i]))
  const chosen = []
  const picks = pieces.map(() => '-')
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('start the search with no piece placed'), piece: null, dest: null, picks: [...picks], count, message: 'Every piece may move to any square it can reach, including staying put.' }]
  const search = i => {
    if (i === pieces.length) {
      count++
      frames.push({ phase: 'count', activeLine: L('count one combination'), piece: null, dest: null, picks: [...picks], count, message: `A full valid combination; the count is ${count}.` })
      return
    }
    for (const dest of options[i]) {
      const candidate = { start: positions[i], dest }
      if (chosen.some(other => clash(other, candidate))) {
        frames.push({ phase: 'reject', activeLine: L('skip this square'), piece: i, dest, picks: [...picks], count, message: `${pieces[i]} to ${dest.join(',')} clashes with an earlier piece at some second.` })
        continue
      }
      chosen.push(candidate)
      picks[i] = dest.join(',')
      frames.push({ phase: 'choose', activeLine: L('choose the square and call search'), piece: i, dest, picks: [...picks], count, message: `${pieces[i]} takes ${dest.join(',')}.` })
      search(i + 1)
      chosen.pop()
      picks[i] = '-'
    }
  }
  search(0)
  frames.push({ phase: 'done', activeLine: L('return the count'), piece: null, dest: null, picks: [...picks], count, message: `Valid move combinations: ${count}.` })
  return { input: { pieces, positions }, result: count, frames }
}

export const code = `count valid move combinations
  list the squares each piece can reach, including its own square
  start the search with no piece placed
  search(piece)
    if every piece has a square then
      count one combination
      stop
    for each reachable square of this piece
      if it clashes with an earlier chosen piece then
        skip this square
      otherwise
        choose the square and call search on the next piece
  return the count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_move_combinations(pieces, positions):
    def destinations(kind, r, c):
        result = [(r, c)]
        directions = []
        if kind in ('rook', 'queen'):
            directions += [(1, 0), (-1, 0), (0, 1), (0, -1)]
        if kind in ('bishop', 'queen'):
            directions += [(1, 1), (1, -1), (-1, 1), (-1, -1)]
        for dr, dc in directions:
            k = 1
            while 1 <= r + dr * k <= 8 and 1 <= c + dc * k <= 8:
                result.append((r + dr * k, c + dc * k))
                k += 1
        return result

    def sign(x):
        return (x > 0) - (x < 0)

    def distance(start, dest):
        return max(abs(dest[0] - start[0]), abs(dest[1] - start[1]))

    def position_at(start, dest, t):
        k = min(t, distance(start, dest))
        return (start[0] + sign(dest[0] - start[0]) * k, start[1] + sign(dest[1] - start[1]) * k)

    def clash(a, b):
        horizon = max(distance(a[0], a[1]), distance(b[0], b[1]))
        for t in range(horizon + 1):
            if position_at(a[0], a[1], t) == position_at(b[0], b[1], t):
                return True
        return False

    options = [destinations(kind, r, c) for kind, (r, c) in zip(pieces, positions)]
    starts = [(r, c) for r, c in positions]
    chosen = []
    count = 0

    def search(i):
        nonlocal count
        if i == len(pieces):
            count += 1
            return
        for dest in options[i]:
            candidate = (starts[i], dest)
            if any(clash(other, candidate) for other in chosen):
                continue
            chosen.append(candidate)
            search(i + 1)
            chosen.pop()

    search(0)
    return count
`
