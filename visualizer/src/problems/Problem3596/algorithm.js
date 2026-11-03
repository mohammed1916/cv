export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with rows and cols.')
  const { rows, cols } = input
  if (!Number.isInteger(rows) || rows < 1 || rows > 6) throw new Error('rows is an integer from 1 to 6.')
  if (!Number.isInteger(cols) || cols < 1 || cols > 6) throw new Error('cols is an integer from 1 to 6.')
  return { rows, cols }
}

const entryCost = (i, j) => (i + 1) * (j + 1)

export function buildTrace({ rows, cols }) {
  const INF = Infinity
  const best = Array.from({ length: rows }, () => Array.from({ length: cols }, () => [INF, INF]))
  const settled = Array.from({ length: rows }, () => Array.from({ length: cols }, () => [false, false]))
  const snapshot = () => best.map(row => row.map(([even, odd]) => [even === INF ? null : even, odd === INF ? null : odd]))
  const frames = []
  const frame = fields => frames.push({ best: snapshot(), settled: settled.map(row => row.map(s => [...s])), ...fields })
  best[0][0][0] = entryCost(0, 0)
  frame({ pythonLine: P('best[0][0][0]'), phase: 'start', activeLine: L('start at cell (0, 0)'), row: 0, col: 0, parity: 0, cost: best[0][0][0], message: `Enter (0, 0) for ${entryCost(0, 0)}; the first move is right or down.` })
  let answer = -1
  while (true) {
    let row = -1
    let col = -1
    let parity = -1
    let cost = INF
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        for (let p = 0; p < 2; p++) {
          if (!settled[i][j][p] && best[i][j][p] < cost) {
            row = i
            col = j
            parity = p
            cost = best[i][j][p]
          }
        }
      }
    }
    if (row < 0) break
    settled[row][col][parity] = true
    frame({ pythonLine: P('settled[row][col][parity] = True'), phase: 'pop', activeLine: L('take the unsettled state'), row, col, parity, cost, message: `Settle (${row}, ${col}) with ${parity === 0 ? 'right or down' : 'left or up'} as the next move at cost ${cost}.` })
    if (row === rows - 1 && col === cols - 1) {
      answer = cost
      frame({ pythonLine: P('return cost'), phase: 'done', activeLine: L('return its cost'), row, col, parity, cost, message: `The opposite corner is reached for ${cost}.` })
      break
    }
    const steps = parity === 0 ? [[row, col + 1], [row + 1, col]] : [[row, col - 1], [row - 1, col]]
    for (const [r, c] of steps) {
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue
      const candidate = cost + entryCost(r, c)
      const next = 1 - parity
      if (candidate < best[r][c][next]) {
        best[r][c][next] = candidate
        frame({ pythonLine: P('best[r][c][1 - parity] = new'), phase: 'relax', activeLine: L('if the new cost is smaller'), row: r, col: c, parity: next, cost: candidate, from: [row, col], message: `Move to (${r}, ${c}) for ${entryCost(r, c)}; total ${candidate}.` })
      }
    }
  }
  if (answer < 0) frame({ pythonLine: P('return -1'), phase: 'done', activeLine: L('return -1'), row: -1, col: -1, parity: -1, cost: -1, message: 'Every reachable state is settled and the opposite corner was never reached: the answer is -1.' })
  return { input: { rows, cols }, result: answer, frames }
}

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const code = `minimum cost to reach the bottom right cell with alternating moves
  best[cell][parity] is the least cost to stand on cell when parity moves are made
  start at cell (0, 0) with its entry cost and an even move count
  repeat while an unsettled state has a finite cost
    take the unsettled state with the least cost and settle it
    if the cell is the bottom right corner return its cost
    an even count means the next move is right or down, odd means left or up
    for each move that stays inside the grid
      if the new cost is smaller than recorded, record it
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text: text.trimEnd() }))

export const python = `def min_alternating_cost(rows, cols):
    INF = float("inf")
    best = [[[INF, INF] for _ in range(cols)] for _ in range(rows)]
    settled = [[[False, False] for _ in range(cols)] for _ in range(rows)]
    best[0][0][0] = 1
    while True:
        row, col, parity, cost = -1, -1, -1, INF
        for i in range(rows):
            for j in range(cols):
                for p in range(2):
                    if not settled[i][j][p] and best[i][j][p] < cost:
                        row, col, parity, cost = i, j, p, best[i][j][p]
        if row < 0:
            return -1
        settled[row][col][parity] = True
        if row == rows - 1 and col == cols - 1:
            return cost
        if parity == 0:
            steps = [(row, col + 1), (row + 1, col)]
        else:
            steps = [(row, col - 1), (row - 1, col)]
        for r, c in steps:
            if 0 <= r < rows and 0 <= c < cols:
                new = cost + (r + 1) * (c + 1)
                if new < best[r][c][1 - parity]:
                    best[r][c][1 - parity] = new
    return -1
`
