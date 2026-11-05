// Largest submatrix after rearranging columns: in each row, sort the column heights and read the best rectangle.
const JS_LINES = [
  { text: 'const m = matrix.length, n = matrix[0].length', py: 'm, n = ' },
  { text: 'const h = new Array(n).fill(0)', py: 'h = [0] * n' },
  { text: 'let best = 0', py: 'best = 0' },
  { text: 'for (let r = 0; r < m; r++) {', py: 'for r in range(m)' },
  { text: 'for (let c = 0; c < n; c++) h[c] = matrix[r][c] === 1 ? h[c] + 1 : 0', py: 'h[c] = h[c] + 1' },
  { text: 'const sorted = [...h].sort((a, b) => b - a)', py: 'for j, height in enumerate' },
  { text: 'for (let j = 0; j < n; j++) best = Math.max(best, sorted[j] * (j + 1))', py: 'best = max(best, height' },
  { text: '}', py: null },
  { text: 'return best', py: 'return best' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def largestSubmatrix(matrix):
    m, n = len(matrix), len(matrix[0])
    h = [0] * n
    best = 0
    for r in range(m):
        for c in range(n):
            h[c] = h[c] + 1 if matrix[r][c] == 1 else 0
        for j, height in enumerate(sorted(h, reverse=True)):
            best = max(best, height * (j + 1))
    return best
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return best')]))

export const phases = [
  { id: 'heights', label: 'Heights', description: 'Each column counts the run of 1s ending in this row.' },
  { id: 'sort', label: 'Sort heights', description: 'Columns can be rearranged, so sort the heights from tallest to shortest.' },
  { id: 'area', label: 'Area', description: 'The first j+1 columns of the sorted heights form a rectangle of height sorted[j].' },
  { id: 'done', label: 'Result', description: 'The largest rectangle over all rows.' },
]

export const examples = [
  { label: 'Staircase', input: '[[0,1,1],[1,1,0],[1,1,1]]' },
  { label: 'Single row', input: '[[1,0,1]]' },
]

export const complexity = 'O(m * n log n) time for an m by n matrix, dominated by sorting each row. The visual caps the matrix at 6 by 6.'

export function parseInput(text) {
  const matrix = JSON.parse(text)
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 6) throw new Error('Use 1 to 6 rows (visual cap).')
  const n = matrix[0].length
  if (n < 1 || n > 6) throw new Error('Use 1 to 6 columns (visual cap).')
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== n || !row.every(v => v === 0 || v === 1)) throw new Error('Every row has the same length and holds 0 or 1.')
  }
  return matrix
}

export function buildTrace(matrix) {
  const m = matrix.length
  const n = matrix[0].length
  const frames = []
  const h = new Array(n).fill(0)
  let best = 0
  const snap = extra => ({ h: [...h], best, ...extra })
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) h[c] = matrix[r][c] === 1 ? h[c] + 1 : 0
    frames.push({ phase: 'heights', activeLine: 5, row: r, message: `Row ${r + 1}: column heights [${h.join(', ')}].`, snapshot: snap({}) })
    const sorted = [...h].sort((a, b) => b - a)
    frames.push({ phase: 'sort', activeLine: 6, row: r, sorted, message: `Sorted heights [${sorted.join(', ')}].`, snapshot: snap({ sorted }) })
    for (let j = 0; j < n; j++) {
      const area = sorted[j] * (j + 1)
      if (area > best) best = area
      frames.push({ phase: 'area', activeLine: 7, row: r, sorted, j, area, message: `${j + 1} column${j === 0 ? '' : 's'} of height ${sorted[j]}: area ${area}.`, snapshot: snap({ sorted }) })
    }
  }
  frames.push({ phase: 'done', activeLine: 9, row: -1, result: best, message: `Largest area ${best}.`, snapshot: snap({ result: best }) })
  return { input: matrix, result: best, frames }
}
