export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with best side 0 and an empty prefix-sum table.' },
  { id: 'prefix', label: 'Prefix sums', description: 'Build sums of every top-left rectangle so any square sum costs four lookups.' },
  { id: 'cell', label: 'Bottom-right cell', description: 'Treat the current cell as the bottom-right corner of candidate squares.' },
  { id: 'test', label: 'Test next side', description: 'Try a square one larger than the best so far ending at this cell.' },
  { id: 'grow', label: 'Grow best', description: 'The square fits under the threshold, so the best side grows.' },
  { id: 'done', label: 'Complete', description: 'Return the largest side that fits.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"mat": [[1, 2], [3, 4]], "threshold": 5}.')
  const { mat, threshold } = input
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 8 || !mat.every(r => Array.isArray(r) && r.length === mat[0].length && r.length >= 1 && r.length <= 8)) throw new Error('mat is a rectangle of 1 to 8 rows and 1 to 8 columns.')
  if (!mat.every(r => r.every(v => Number.isInteger(v) && v >= 0 && v <= 20))) throw new Error('Matrix values are integers from 0 to 20.')
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 200) throw new Error('threshold is an integer from 0 to 200.')
  return { mat, threshold }
}

export function buildTrace({ mat, threshold }) {
  const m = mat.length, n = mat[0].length
  const P = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) P[i + 1][j + 1] = mat[i][j] + P[i][j + 1] + P[i + 1][j] - P[i][j]
  const rect = (r1, c1, r2, c2) => P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]
  let best = 0
  const snap = (cell, side, sum, fits) => ({ m, n, threshold, cell, side, sum, fits, best, prefix: P.map(r => [...r]) })
  const frames = [{ phase: 'start', activeLine: L('set best to 0'), pythonLine: P_('best = 0'), snapshot: snap(null, null, null, null), message: `Find the largest square whose sum is at most ${threshold}.` }]
  frames.push({ phase: 'prefix', activeLine: L('build prefix sums'), pythonLine: P_('prefix[i + 1][j + 1]'), snapshot: snap(null, null, null, null), message: 'Each prefix entry sums the rectangle from the top-left corner to that point.' })
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    frames.push({ phase: 'cell', activeLine: L('for each cell'), pythonLine: P_('for i in range(m)'), snapshot: snap([i, j], null, null, null), message: `Bottom-right corner at row ${i}, column ${j}. Largest possible side here is ${Math.min(i, j) + 1}.` })
    let candidate = best + 1
    while (candidate <= Math.min(i, j) + 1) {
      const sum = rect(i - candidate + 1, j - candidate + 1, i, j)
      if (sum > threshold) {
        frames.push({ phase: 'test', activeLine: L('if the square of side'), pythonLine: P_('if rect_sum'), snapshot: snap([i, j], candidate, sum, false), message: `Side ${candidate} sums to ${sum}, above ${threshold}. Larger squares here cannot fit either.` })
        break
      }
      best = candidate
      frames.push({ phase: 'grow', activeLine: L('set best = candidate'), pythonLine: P_('best = candidate'), snapshot: snap([i, j], candidate, sum, true), message: `Side ${candidate} sums to ${sum}, within ${threshold}. Best side is now ${best}.` })
      candidate++
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P_('return best'), snapshot: snap(null, null, null, null), message: `Largest side that fits: ${best}.` })
  return { input: { mat, threshold }, result: best, frames }
}

export const code = `find the largest square with sum at most threshold:
  build prefix sums so rectangle sums need four lookups
  set best to 0
  for each cell (i, j) as bottom-right corner:
    set candidate to best + 1
    while candidate fits inside the matrix at (i, j):
      if the square of side candidate sums to more than threshold:
        stop for this cell
      set best = candidate
      increase candidate by 1
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def rect_sum(prefix, r1, c1, r2, c2):
    return prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1] - prefix[r2 + 1][c1] + prefix[r1][c1]

def max_side_length(mat, threshold):
    m, n = len(mat), len(mat[0])
    prefix = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m):
        for j in range(n):
            prefix[i + 1][j + 1] = mat[i][j] + prefix[i][j + 1] + prefix[i + 1][j] - prefix[i][j]
    best = 0
    for i in range(m):
        for j in range(n):
            candidate = best + 1
            while candidate <= min(i, j) + 1:
                if rect_sum(prefix, i - candidate + 1, j - candidate + 1, i, j) > threshold:
                    break
                best = candidate
                candidate += 1
    return best
`
const P_ = s => python.split('\n').findIndex(l => l.includes(s)) + 1
