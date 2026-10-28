// Clockwise order of the four diagonal directions, as [row step, column step].
const DIRS = [[1, 1], [1, -1], [-1, -1], [-1, 1]]
const other = v => (v === 2 ? 0 : 2)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.grid)) throw new Error('Use a JSON object with a grid array of rows.')
  const { grid } = input
  if (grid.length < 1 || grid.length > 7) throw new Error('grid must have 1 to 7 rows.')
  const width = grid[0].length
  if (width < 1 || width > 7) throw new Error('each row must have 1 to 7 cells.')
  if (grid.some(row => !Array.isArray(row) || row.length !== width)) throw new Error('all rows must have the same length.')
  if (grid.some(row => row.some(v => ![0, 1, 2].includes(v)))) throw new Error('cells hold only 0, 1 or 2.')
  return { grid }
}

export function buildTrace(input) {
  const { grid } = input
  const rows = grid.length
  const cols = grid[0].length
  const inside = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols
  const memo = new Map()
  const frames = [{ phase: 'start', activeLine: L('best = 0'), cell: null, length: 0, message: 'Look for every cell holding 1. Each one can start a segment in four diagonal directions.' }]
  // Length of the part of the segment after (r, c), given the next cell must hold `want`.
  const walk = (r, c, d, canTurn, want) => {
    const key = `${r},${c},${d},${canTurn},${want}`
    if (memo.has(key)) return memo.get(key)
    let answer = 0
    const [dr, dc] = DIRS[d]
    const ahead = [r + dr, c + dc]
    if (inside(...ahead) && grid[ahead[0]][ahead[1]] === want) {
      answer = Math.max(answer, 1 + walk(ahead[0], ahead[1], d, canTurn, other(want)))
    }
    if (canTurn) {
      const nd = (d + 1) % 4
      const [tr, tc] = DIRS[nd]
      const turned = [r + tr, c + tc]
      if (inside(...turned) && grid[turned[0]][turned[1]] === want) {
        answer = Math.max(answer, 1 + walk(turned[0], turned[1], nd, false, other(want)))
      }
    }
    memo.set(key, answer)
    return answer
  }
  let best = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue
      for (let d = 0; d < 4; d++) {
        const length = 1 + walk(r, c, d, true, 2)
        if (length > best) best = length
        frames.push({ phase: 'extend', activeLine: L('for every diagonal direction'), cell: [r, c], length, best, message: `Cell (${r},${c}) heading direction ${d} reaches length ${length}. Best so far: ${best}.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), cell: null, length: best, best, message: `Longest V-shaped segment: ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest v-shaped diagonal segment in grid:
  best = 0
  for every cell holding 1:
    for every diagonal direction d:
      best = max(best, 1 + walk(cell, d, true, 2))
  return best
walk(cell, d, can turn, want):
  answer = 0
  step straight: if the next cell holds want then
    answer = max(answer, 1 + walk(next, d, can turn, other(want)))
  if can turn: step after a clockwise turn: if that cell holds want then
    answer = max(answer, 1 + walk(next, turned d, false, other(want)))
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_v_shaped(grid):
    rows, cols = len(grid), len(grid[0])
    dirs = [(1, 1), (1, -1), (-1, -1), (-1, 1)]
    other = {2: 0, 0: 2}
    memo = {}

    def inside(r, c):
        return 0 <= r < rows and 0 <= c < cols

    def walk(r, c, d, can_turn, want):
        key = (r, c, d, can_turn, want)
        if key in memo:
            return memo[key]
        answer = 0
        dr, dc = dirs[d]
        if inside(r + dr, c + dc) and grid[r + dr][c + dc] == want:
            answer = max(answer, 1 + walk(r + dr, c + dc, d, can_turn, other[want]))
        if can_turn:
            nd = (d + 1) % 4
            tr, tc = dirs[nd]
            if inside(r + tr, c + tc) and grid[r + tr][c + tc] == want:
                answer = max(answer, 1 + walk(r + tr, c + tc, nd, False, other[want]))
        memo[key] = answer
        return answer

    best = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                for d in range(4):
                    best = max(best, 1 + walk(r, c, d, True, 2))
    return best
`
