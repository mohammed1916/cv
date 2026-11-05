const MOVES = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]

export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, k, row, column } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 25) throw new Error('n must be an integer from 1 to 25 (the board is shown in full).')
  if (!Number.isInteger(k) || k < 0 || k > 100) throw new Error('k must be an integer from 0 to 100.')
  if (!Number.isInteger(row) || !Number.isInteger(column) || row < 0 || column < 0 || row >= n || column >= n) throw new Error('The start square must be on the board.')
  return { n, k, row, column }
}

// Each step, a knight on a square with probability p moves to each of its legal squares with probability p / 8.
// Keep one table per step; the answer is the total probability still on the board after k steps.
export function buildTrace({ n, k, row, column }) {
  let prob = Array.from({ length: n }, () => Array(n).fill(0))
  prob[row][column] = 1
  const frames = [{ phase: 'start', step: 0, board: prob.map(r => [...r]), activeLine: L('let prob = '), pythonLine: P('prob = [['), message: `The knight starts at (${row}, ${column}) with probability 1.` }]
  for (let step = 1; step <= k; step++) {
    const next = Array.from({ length: n }, () => Array(n).fill(0))
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (prob[r][c] === 0) continue
        for (const [dr, dc] of MOVES) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < n && nc >= 0 && nc < n) next[nr][nc] += prob[r][c] / 8
        }
      }
    }
    prob = next
    frames.push({ phase: 'step', step, board: prob.map(r => [...r]), activeLine: L('next[nr][nc] +='), pythonLine: P('nxt[nr][nc] +='), message: `After move ${step}: the board holds ${total(prob).toFixed(4)} probability.` })
  }
  const result = total(prob)
  frames.push({ phase: 'done', step: k, board: prob.map(r => [...r]), result, activeLine: L('return prob.flat'), pythonLine: P('return sum'), message: `Probability the knight is still on the board: ${result.toFixed(4)}.` })
  return { input: { n, k, row, column }, result, frames }
}

function total(board) {
  return board.reduce((sum, r) => sum + r.reduce((a, b) => a + b, 0), 0)
}

const SOURCE = `function knightProbability(n, k, row, column) {
  const moves = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
  let prob = Array.from({ length: n }, () => Array(n).fill(0))
  prob[row][column] = 1
  for (let step = 0; step < k; step++) {
    const next = Array.from({ length: n }, () => Array(n).fill(0))
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        for (const [dr, dc] of moves) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < n && nc >= 0 && nc < n) next[nr][nc] += prob[r][c] / 8
        }
      }
    }
    prob = next
  }
  return prob.flat().reduce((a, b) => a + b, 0)
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def knight_probability(n, k, row, column):
    moves = [(1, 2), (2, 1), (2, -1), (1, -2), (-1, -2), (-2, -1), (-2, 1), (-1, 2)]
    prob = [[0.0] * n for _ in range(n)]
    prob[row][column] = 1.0
    for _ in range(k):
        nxt = [[0.0] * n for _ in range(n)]
        for r in range(n):
            for c in range(n):
                for dr, dc in moves:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < n and 0 <= nc < n:
                        nxt[nr][nc] += prob[r][c] / 8
        prob = nxt
    return sum(sum(row) for row in prob)`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
