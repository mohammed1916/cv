export const phases = [
  { id: 'start', label: 'Start', description: 'Each row is still unscored. Its strength will be the number of soldiers (ones) in it.' },
  { id: 'count', label: 'Count soldiers', description: 'Add each row as a pair of its soldier count and its row index. The index keeps ties in a fixed order.' },
  { id: 'order', label: 'Order rows', description: 'Sort the pairs by strength first, then by row index, so equal strengths keep their original order.' },
  { id: 'done', label: 'Complete', description: 'Take the first k row indices from the sorted order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"mat": [[1, 0], [1, 1]], "k": 1}.')
  const { mat, k } = input
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 12) throw new Error('mat must have 1 to 12 rows.')
  const width = Array.isArray(mat[0]) ? mat[0].length : 0
  if (width < 1 || width > 12) throw new Error('Each row must have 1 to 12 values.')
  if (!mat.every(row => Array.isArray(row) && row.length === width && row.every(v => v === 0 || v === 1))) throw new Error('Every row must have the same length and contain only 0 or 1.')
  if (!Number.isInteger(k) || k < 1 || k > mat.length) throw new Error(`k is an integer from 1 to ${mat.length}.`)
  return { mat, k }
}

const at = (code_, py) => ({ activeLine: L(code_), pythonLine: P(py ?? code_) })
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ mat, k }) {
  const frames = []
  const keyed = []
  frames.push({ phase: 'start', ...at('strengths = []', 'keyed = []'), message: `There are ${mat.length} rows. Find the ${k} weakest, with ties going to the smaller row index.`, snapshot: { rows: mat, keyed: [], order: null, chosen: null } })

  mat.forEach((row, index) => {
    const count = row.reduce((sum, v) => sum + v, 0)
    keyed.push([count, index])
    frames.push({
      phase: 'count', ...at('append', 'append'),
      message: `Row ${index}: ${count} soldier${count === 1 ? '' : 's'}. Store the pair (${count}, ${index}).`,
      snapshot: { rows: mat, keyed: keyed.map(p => [...p]), order: null, chosen: null, current: index },
    })
  })

  const order = [...keyed].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  frames.push({
    phase: 'order', ...at('sort strengths', 'keyed.sort'),
    message: `Sorted by strength, then index: ${order.map(([c, i]) => `row ${i} (${c})`).join(', ')}.`,
    snapshot: { rows: mat, keyed: keyed.map(p => [...p]), order: order.map(p => [...p]), chosen: null },
  })

  const result = order.slice(0, k).map(([, index]) => index)
  frames.push({
    phase: 'done', ...at('return the first', 'return [i'),
    message: `The first ${k} entries are rows ${result.join(', ')}, weakest first.`,
    snapshot: { rows: mat, keyed: keyed.map(p => [...p]), order: order.map(p => [...p]), chosen: result },
  })
  return { input: { mat, k }, result, frames }
}

export const code = `k weakest rows (mat, k):
  strengths = []
  for each row index i:
    strengths.append((count of ones in row, i))
  sort strengths by (count, index)
  return the first k indices`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def k_weakest_rows(mat, k):
    keyed = []
    for i, row in enumerate(mat):
        keyed.append((sum(row), i))
    keyed.sort()
    return [i for _, i in keyed[:k]]
`
