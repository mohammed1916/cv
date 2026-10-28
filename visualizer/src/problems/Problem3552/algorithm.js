export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with matrix, for example {"matrix":["A..",".A.","..."]}.')
  const { matrix } = data
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 5) throw new Error('matrix must have 1 to 5 rows.')
  const width = typeof matrix[0] === 'string' ? matrix[0].length : 0
  if (width < 1 || width > 5) throw new Error('Each row must have 1 to 5 characters.')
  for (const row of matrix) {
    if (typeof row !== 'string' || row.length !== width) throw new Error('Every row must be a string of the same length.')
    if ([...row].some(ch => !(ch === '.' || ch === '#' || (ch >= 'A' && ch <= 'Z')))) throw new Error('Cells are "." (empty), "#" (obstacle) or an uppercase portal letter.')
  }
  if (matrix[0][0] === '#') throw new Error('The top-left cell cannot be an obstacle.')
  const letters = new Set(matrix.join('').replace(/[.#]/g, ''))
  if (letters.size > 6) throw new Error('Use at most 6 different portal letters.')
  return { matrix: [...matrix] }
}

export function buildTrace(input) {
  const { matrix } = input
  const R = matrix.length
  const C = matrix[0].length
  const bit = ch => 1 << (ch.charCodeAt(0) - 65)
  const portals = {}
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const ch = matrix[r][c]
    if (ch >= 'A' && ch <= 'Z') (portals[ch] = portals[ch] || []).push([r, c])
  }
  const seen = new Set()
  const flat = (r, c) => r * C + c
  let frontier = [[0, 0, 0]]
  const frames = [{ phase: 'start', activeLine: L('set the frontier to the start cell'), at: 0, moves: 0, message: 'Start at the top-left cell with no portal letters used.' }]
  let moves = 0
  while (frontier.length) {
    const stack = [...frontier]
    const next = []
    frames.push({ phase: 'layer', activeLine: L('repeat while the stack is not empty'), at: flat(frontier[0][0], frontier[0][1]), moves, message: `${moves} move${moves === 1 ? '' : 's'}: ${frontier.length} state${frontier.length === 1 ? '' : 's'} to expand. Teleports cost no move.` })
    while (stack.length) {
      const [r, c, mask] = stack.pop()
      const k = `${r},${c},${mask}`
      if (seen.has(k)) continue
      seen.add(k)
      if (r === R - 1 && c === C - 1) {
        frames.push({ phase: 'done', activeLine: L('return moves'), at: flat(r, c), moves, message: `Reached the bottom-right cell in ${moves} moves.` })
        return { input, result: moves, frames }
      }
      const ch = matrix[r][c]
      if (ch >= 'A' && ch <= 'Z' && !(mask & bit(ch))) {
        for (const [r2, c2] of portals[ch]) {
          if (r2 === r && c2 === c) continue
          stack.push([r2, c2, mask | bit(ch)])
        }
        frames.push({ phase: 'teleport', activeLine: L('teleport to every other cell'), at: flat(r, c), moves, message: `Portal ${ch} at row ${r}, column ${c} teleports for free to its matching cells.` })
      }
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const r2 = r + dr
        const c2 = c + dc
        if (r2 >= 0 && r2 < R && c2 >= 0 && c2 < C && matrix[r2][c2] !== '#') next.push([r2, c2, mask])
      }
    }
    frontier = next.filter(([r, c, mask]) => !seen.has(`${r},${c},${mask}`))
    moves++
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), at: -1, moves: -1, message: 'The bottom-right cell cannot be reached, so the answer is -1.' })
  return { input, result: -1, frames }
}

export const code = `grid teleportation traversal (matrix)
  set the frontier to the start cell with no portal letters used
  set moves to 0
  repeat while the frontier is not empty
    set the stack to the frontier
    repeat while the stack is not empty
      take a state (cell, used letters) from the stack
      skip it if it was already seen
      if the cell is the bottom-right cell then return moves
      if the cell is a portal with an unused letter then teleport to every other cell with that letter at no cost
      for each neighbour that is not an obstacle add it to the next frontier
    set the frontier to the next frontier
    add one to moves
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def min_teleport_moves(matrix):
    R, C = len(matrix), len(matrix[0])
    portals = {}
    for r in range(R):
        for c in range(C):
            ch = matrix[r][c]
            if 'A' <= ch <= 'Z':
                portals.setdefault(ch, []).append((r, c))
    seen = set()
    frontier = [(0, 0, 0)]
    moves = 0
    while frontier:
        stack = list(frontier)
        nxt = []
        while stack:
            state = stack.pop()
            if state in seen:
                continue
            seen.add(state)
            r, c, mask = state
            if (r, c) == (R - 1, C - 1):
                return moves
            ch = matrix[r][c]
            if 'A' <= ch <= 'Z' and not (mask >> (ord(ch) - 65)) & 1:
                for r2, c2 in portals[ch]:
                    if (r2, c2) != (r, c):
                        stack.append((r2, c2, mask | (1 << (ord(ch) - 65))))
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                r2, c2 = r + dr, c + dc
                if 0 <= r2 < R and 0 <= c2 < C and matrix[r2][c2] != '#':
                    nxt.append((r2, c2, mask))
        frontier = [s for s in nxt if s not in seen]
        moves += 1
    return -1
`
