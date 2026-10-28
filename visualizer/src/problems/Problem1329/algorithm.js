export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a mat array.')
  const { mat } = input
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 6 || !Array.isArray(mat[0]) || mat[0].length < 1 || mat[0].length > 6) throw new Error('mat must be at most 6 by 6.')
  const n = mat[0].length
  if (mat.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 1 || v > 100))) throw new Error('mat must be rectangular, with integers from 1 to 100.')
  return { mat }
}

export function buildTrace(input) {
  const { mat } = input
  const rows = mat.length
  const cols = mat[0].length
  const result = mat.map(row => [...row])
  const starts = [...Array.from({ length: cols }, (_, c) => [0, c]), ...Array.from({ length: rows - 1 }, (_, r) => [r + 1, 0])]
  const frames = [{ phase: 'start', activeLine: L('for each diagonal'), mat: result.map(r => [...r]), cells: [], message: 'Each diagonal is sorted on its own.' }]
  for (const [sr, sc] of starts) {
    const cells = []
    for (let r = sr, c = sc; r < rows && c < cols; r++, c++) cells.push([r, c])
    const values = cells.map(([r, c]) => result[r][c])
    // Insertion sort keeps the swaps visible in the narration.
    for (let i = 1; i < values.length; i++) {
      for (let j = i; j > 0 && values[j - 1] > values[j]; j--) {
        const held = values[j - 1]
        values[j - 1] = values[j]
        values[j] = held
      }
    }
    cells.forEach(([r, c], i) => { result[r][c] = values[i] })
    frames.push({ phase: 'diagonal', activeLine: L('sort those values'), mat: result.map(row => [...row]), cells, message: `Diagonal from (${sr}, ${sc}) is now ${values.join(', ')}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return mat'), mat: result.map(row => [...row]), cells: [], message: 'Every diagonal is sorted.' })
  return { input, result, frames }
}

export const code = `sort the matrix diagonally (mat):
  for each diagonal that starts in the top row or left column
    collect the values along the diagonal
    sort those values in ascending order
    write them back along the same diagonal
  return mat`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def diagonal_sort(mat):
    rows, cols = len(mat), len(mat[0])
    result = [row[:] for row in mat]
    starts = [(0, c) for c in range(cols)] + [(r, 0) for r in range(1, rows)]
    for sr, sc in starts:
        cells = []
        r, c = sr, sc
        while r < rows and c < cols:
            cells.append((r, c))
            r += 1
            c += 1
        values = sorted(result[r][c] for r, c in cells)
        for (r, c), value in zip(cells, values):
            result[r][c] = value
    return result
`
