// Kth largest XOR coordinate value: prefix XORs over the rectangle from (0, 0); sort the values and take the kth largest.
const JS_LINES = [
  { text: 'const m = matrix.length, n = matrix[0].length', py: 'm, n = ' },
  { text: 'const pre = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))', py: 'pre = [[0]' },
  { text: 'const values = []', py: 'values = []' },
  { text: 'for (let i = 0; i < m; i++) {', py: 'for i in range(m)' },
  { text: 'for (let j = 0; j < n; j++) {', py: 'for j in range(n)' },
  { text: 'pre[i + 1][j + 1] = pre[i][j + 1] ^ pre[i + 1][j] ^ pre[i][j] ^ matrix[i][j]', py: 'pre[i + 1][j + 1]' },
  { text: 'values.push(pre[i + 1][j + 1])', py: 'values.append' },
  { text: '}', py: null },
  { text: '}', py: null },
  { text: 'values.sort((a, b) => b - a)', py: 'values.sort' },
  { text: 'return values[k - 1]', py: 'return values[k - 1]' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def kthLargestValue(matrix, k):
    m, n = len(matrix), len(matrix[0])
    pre = [[0] * (n + 1) for _ in range(m + 1)]
    values = []
    for i in range(m):
        for j in range(n):
            pre[i + 1][j + 1] = pre[i][j + 1] ^ pre[i + 1][j] ^ pre[i][j] ^ matrix[i][j]
            values.append(pre[i + 1][j + 1])
    values.sort(reverse=True)
    return values[k - 1]
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return values[k - 1]')]))

export const phases = [
  { id: 'prefix', label: 'Prefix XOR', description: 'Each cell is the XOR of the rectangle from the top-left corner to it.' },
  { id: 'collect', label: 'Collect', description: 'Every prefix value goes into the list.' },
  { id: 'sort', label: 'Sort', description: 'Sort from largest to smallest.' },
  { id: 'done', label: 'Result', description: 'The kth entry of the sorted list.' },
]

export const examples = [
  { label: 'Small grid', input: '{"matrix":[[3,1],[2,4]],"k":2}' },
  { label: 'Single row', input: '{"matrix":[[6,1,2]],"k":3}' },
]

export const complexity = 'O(m * n log(m * n)) time and O(m * n) space for an m by n matrix.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.matrix) || !Number.isInteger(input.k)) throw new Error('Use an object with matrix and k.')
  const { matrix, k } = input
  if (matrix.length < 1 || matrix.length > 6) throw new Error('matrix has 1 to 6 rows (visual cap).')
  const n = matrix[0].length
  if (n < 1 || n > 6) throw new Error('matrix has 1 to 6 columns (visual cap).')
  if (!matrix.every(row => Array.isArray(row) && row.length === n && row.every(v => Number.isInteger(v) && v >= 0 && v <= 15))) throw new Error('Rows have the same length; values are integers from 0 to 15.')
  if (!Number.isInteger(k) || k < 1 || k > matrix.length * n) throw new Error('k is from 1 to the number of cells.')
  return { matrix, k }
}

export function buildTrace({ matrix, k }) {
  const m = matrix.length
  const n = matrix[0].length
  const pre = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  const values = []
  const frames = []
  const snap = extra => ({ pre: pre.map(r => [...r]), values: [...values], ...extra })
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      pre[i + 1][j + 1] = pre[i][j + 1] ^ pre[i + 1][j] ^ pre[i][j] ^ matrix[i][j]
      values.push(pre[i + 1][j + 1])
      frames.push({ phase: 'prefix', activeLine: 6, cell: [i, j], message: `Cell (${i}, ${j}) prefix XOR is ${pre[i + 1][j + 1]}.`, snapshot: snap({}) })
    }
  }
  const sorted = [...values].sort((a, b) => b - a)
  frames.push({ phase: 'sort', activeLine: 10, cell: null, sorted, message: `Sorted from largest: [${sorted.join(', ')}].`, snapshot: snap({ sorted }) })
  const result = sorted[k - 1]
  frames.push({ phase: 'done', activeLine: 11, cell: null, sorted, kth: k - 1, result, message: `The ${k}th largest value is ${result}.`, snapshot: snap({ sorted, result }) })
  return { input: { matrix, k }, result, pre, frames }
}
