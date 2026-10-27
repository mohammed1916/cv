const MAX_SIZE = 5
const MOD = 1000000007
const digitValue = ch => (ch >= '0' && ch <= '9' ? Number(ch) : 0)

export function parseInput(text) {
  const data = JSON.parse(text)
  const board = data?.board
  if (!Array.isArray(board) || board.length < 2 || board.length > MAX_SIZE) throw new Error(`board must have 2 to ${MAX_SIZE} rows.`)
  const n = board.length
  for (const row of board) {
    if (typeof row !== 'string' || row.length !== n) throw new Error('board must be square.')
    if (![...row].every(ch => ch === 'X' || ch === 'E' || ch === 'S' || (ch >= '0' && ch <= '9'))) throw new Error("Use digits 0-9, 'X' for an obstacle, and one 'E' and one 'S'.")
  }
  const all = board.join('')
  if (all.split('S').length !== 2 || all.split('E').length !== 2) throw new Error('The board needs exactly one S and one E.')
  if (board[n - 1][n - 1] !== 'S' || board[0][0] !== 'E') throw new Error("S must be the bottom-right cell and E the top-left cell.")
  return { board }
}

export const code = `paths with max score(board):
  set score to unreached for every cell, and set the start S to 0 with one path
  for each cell from the bottom-right back to the top-left:
    skip the start and obstacles
    take the largest score among the cells below, to the right, and diagonal that are reached
    sum the paths that reach that largest score
    if none is reached, leave this cell unreached
    otherwise add this cell's digit to that score and store it with the path count
  if the end E is unreached return [0, 0]
  return [score at E, paths at E mod 1000000007]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ board }) {
  const n = board.length
  const score = Array.from({ length: n }, () => Array(n).fill(null))
  const ways = Array.from({ length: n }, () => Array(n).fill(0))
  score[n - 1][n - 1] = 0
  ways[n - 1][n - 1] = 1
  const view = () => score.map(row => row.map(v => (v === null ? '·' : v)))
  const frames = [{ phase: 'start', activeLine: L('set score to unreached'), row: n - 1, col: n - 1, table: view(), message: 'Start at S with score 0 and one path. Paths move up, left, or up-left.' }]
  for (let r = n - 1; r >= 0; r--) {
    for (let c = n - 1; c >= 0; c--) {
      if (r === n - 1 && c === n - 1) continue
      if (board[r][c] === 'X') {
        frames.push({ phase: 'blocked', activeLine: L('skip the start and obstacles'), row: r, col: c, table: view(), message: `Cell (${r}, ${c}) is an obstacle, so no path enters it.` })
        continue
      }
      let best = null
      let count = 0
      for (const [pr, pc] of [[r + 1, c], [r, c + 1], [r + 1, c + 1]]) {
        if (pr >= n || pc >= n || score[pr][pc] === null) continue
        if (best === null || score[pr][pc] > best) { best = score[pr][pc]; count = ways[pr][pc] } else if (score[pr][pc] === best) count = (count + ways[pr][pc]) % MOD
      }
      if (best === null) {
        frames.push({ phase: 'cell', activeLine: L('if none is reached'), row: r, col: c, table: view(), message: `Cell (${r}, ${c}) cannot be reached from S.` })
        continue
      }
      score[r][c] = best + digitValue(board[r][c])
      ways[r][c] = count
      frames.push({ phase: 'cell', activeLine: L('take the largest score'), row: r, col: c, table: view(), message: `Cell (${r}, ${c}): best score ${score[r][c]} with ${count} path(s).` })
    }
  }
  const result = score[0][0] === null ? [0, 0] : [score[0][0], ways[0][0] % MOD]
  frames.push({ phase: 'done', activeLine: L('return [score'), row: 0, col: 0, table: view(), message: `Maximum score ${result[0]} with ${result[1]} path(s).` })
  return { input: { board }, board, result, frames }
}

export const python = `def paths_with_max_score(board):
    n = len(board)
    MOD = 10**9 + 7
    score = [[None] * n for _ in range(n)]
    ways = [[0] * n for _ in range(n)]
    score[n - 1][n - 1] = 0
    ways[n - 1][n - 1] = 1
    for r in range(n - 1, -1, -1):
        for c in range(n - 1, -1, -1):
            if (r, c) == (n - 1, n - 1) or board[r][c] == 'X':
                continue
            best = None
            count = 0
            for pr, pc in ((r + 1, c), (r, c + 1), (r + 1, c + 1)):
                if pr < n and pc < n and score[pr][pc] is not None:
                    if best is None or score[pr][pc] > best:
                        best = score[pr][pc]
                        count = ways[pr][pc]
                    elif score[pr][pc] == best:
                        count = (count + ways[pr][pc]) % MOD
            if best is not None:
                ch = board[r][c]
                score[r][c] = best + (int(ch) if ch.isdigit() else 0)
                ways[r][c] = count
    if score[0][0] is None:
        return [0, 0]
    return [score[0][0], ways[0][0] % MOD]
`
