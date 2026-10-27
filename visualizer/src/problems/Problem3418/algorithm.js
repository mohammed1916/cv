const MAX_SIZE = 5
const MAX_NEUTRALIZE = 2

export function parseInput(text) {
  const data = JSON.parse(text)
  const coins = data?.coins
  if (!Array.isArray(coins) || coins.length < 1 || coins.length > MAX_SIZE) throw new Error(`coins must have 1 to ${MAX_SIZE} rows.`)
  const n = Array.isArray(coins[0]) ? coins[0].length : 0
  if (n < 1 || n > MAX_SIZE) throw new Error(`Each row must have 1 to ${MAX_SIZE} cells.`)
  for (const row of coins) {
    if (!Array.isArray(row) || row.length !== n) throw new Error('Every row must have the same number of cells.')
    if (row.some(v => !Number.isInteger(v) || v < -10 || v > 10)) throw new Error('Coin values are integers from -10 to 10.')
  }
  return { coins }
}

export const code = `max money(coins):
  set best to a table with, for each cell, the largest money for 0, 1 and 2 neutralized robbers, all unset
  set the top-left cell: taking its coin gives state 0, and neutralizing it (if negative) gives state 1
  for each other cell in row-major order:
    for each state j from the cell above and the cell to the left:
      take the coin: store money + coin in state j for this cell
      if the coin is negative and j < 2, neutralize it: store money in state j + 1
  return the largest money at the bottom-right over all states`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const best = (current, candidate) => (current === null || candidate > current ? candidate : current)

export function buildTrace({ coins }) {
  const m = coins.length
  const n = coins[0].length
  // best[r][c][j] is the most money reaching (r, c) having neutralized exactly j robbers, or null.
  const table = Array.from({ length: m }, () => Array.from({ length: n }, () => [null, null, null]))
  const view = () => table.map(row => row.map(states => {
    const known = states.filter(v => v !== null)
    return known.length ? Math.max(...known) : '·'
  }))
  table[0][0][0] = coins[0][0]
  if (coins[0][0] < 0) table[0][0][1] = 0
  const frames = [{ phase: 'start', activeLine: L('set the top-left cell'), row: 0, col: 0, table: view(), message: `Top-left coin ${coins[0][0]}.` }]
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (r === 0 && c === 0) continue
      const v = coins[r][c]
      const sources = []
      if (r > 0) sources.push(table[r - 1][c])
      if (c > 0) sources.push(table[r][c - 1])
      for (const src of sources) {
        for (let j = 0; j < 3; j++) {
          if (src[j] === null) continue
          table[r][c][j] = best(table[r][c][j], src[j] + v)
          if (v < 0 && j < MAX_NEUTRALIZE) table[r][c][j + 1] = best(table[r][c][j + 1], src[j])
        }
      }
      frames.push({ phase: 'cell', activeLine: L('take the coin'), row: r, col: c, table: view(), message: `Cell (${r}, ${c}) coin ${v}: best money so far ${Math.max(...table[r][c].filter(x => x !== null))}.` })
    }
  }
  const result = Math.max(...table[m - 1][n - 1].filter(x => x !== null))
  frames.push({ phase: 'done', activeLine: L('return the largest money'), row: m - 1, col: n - 1, table: view(), message: `Largest money at the bottom-right: ${result}.` })
  return { input: { coins }, coins, result, frames }
}

export const python = `def max_money(coins):
    m, n = len(coins), len(coins[0])
    best = [[[None] * 3 for _ in range(n)] for _ in range(m)]
    best[0][0][0] = coins[0][0]
    if coins[0][0] < 0:
        best[0][0][1] = 0
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                continue
            v = coins[r][c]
            sources = []
            if r > 0:
                sources.append(best[r - 1][c])
            if c > 0:
                sources.append(best[r][c - 1])
            for src in sources:
                for j in range(3):
                    if src[j] is None:
                        continue
                    take = src[j] + v
                    if best[r][c][j] is None or take > best[r][c][j]:
                        best[r][c][j] = take
                    if v < 0 and j < 2:
                        skip = src[j]
                        if best[r][c][j + 1] is None or skip > best[r][c][j + 1]:
                            best[r][c][j + 1] = skip
    return max(x for x in best[m - 1][n - 1] if x is not None)
`
