export const phases = [
  { id: 'start', label: 'Start', description: 'Each row is a list of soldiers (1) followed by civilians (0), so its strength is the number of 1s.' },
  { id: 'count', label: 'Count soldiers', description: 'Count the 1s in one row; ties will be broken by the smaller row index.' },
  { id: 'sort', label: 'Rank rows', description: 'Sort all rows by strength, then by index.' },
  { id: 'pick', label: 'Take weakest', description: 'Take the next weakest row until k rows are chosen.' },
  { id: 'done', label: 'Complete', description: 'Return the indices of the k weakest rows.' },
]

export const examples = [
  { label: 'Five rows, k = 3', input: '{"mat":[[1,1,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,0,0,0],[1,1,1,1,1]],"k":3}' },
  { label: 'Ties by index', input: '{"mat":[[1,0],[0,0],[1,1],[0,0]],"k":2}' },
    { label: "Single cell", input: "{\"mat\":[[1]],\"k\":1}" },
    { label: "Equal rows", input: "{\"mat\":[[1,1],[1,1]],\"k\":2}" },
    { label: "Largest grid, all ones", input: "{\"mat\":[[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1]],\"k\":12}" },
    { label: "Long run: twelve by twelve random", input: "{\"mat\":[[0,1,1,1,0,0,1,1,0,0,0,1],[0,1,0,1,1,0,1,0,0,1,1,1],[0,0,0,0,0,1,0,1,0,0,0,0],[0,0,0,1,0,1,1,0,0,1,1,1],[0,1,0,0,1,0,1,1,1,1,0,0],[1,1,0,1,0,0,1,0,0,0,0,1],[0,1,1,0,0,1,1,0,1,1,0,1],[1,1,1,1,0,1,0,1,1,0,1,1],[1,1,1,1,0,0,0,1,0,1,1,1],[1,1,0,1,0,1,1,1,1,1,1,1],[0,0,0,1,0,1,1,0,1,1,0,0],[1,0,0,1,0,0,1,0,0,1,1,1]],\"k\":6}" },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.mat)) throw new Error('Use an object with mat and k, such as {"mat":[[1,0],[1,1]],"k":1}.')
  const m = data.mat.length
  if (m < 1 || m > 12) throw new Error('mat must have 1 to 12 rows in this visualization.')
  const n = Array.isArray(data.mat[0]) ? data.mat[0].length : 0
  if (n < 1 || n > 12) throw new Error('mat must have 1 to 12 columns in this visualization.')
  if (data.mat.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('Every row must have the same length.')
  if (data.mat.some(row => row.some(v => v !== 0 && v !== 1))) throw new Error('mat may contain only 0 or 1.')
  if (!Number.isInteger(data.k) || data.k < 1 || data.k > m) throw new Error('k is an integer from 1 to the number of rows.')
  return { mat: data.mat, k: data.k }
}

export function buildTrace({ mat, k }) {
  const strength = []
  const snap = (extra = {}) => ({ mat, strength: strength.map(([s, i]) => ({ row: i, soldiers: s })), k, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const strength = []'), pythonLine: P('strength = []'), snapshot: snap(),
    message: `Find the ${k} weakest rows out of ${mat.length}.` }]
  for (let i = 0; i < mat.length; i++) {
    const s = mat[i].reduce((a, b) => a + b, 0)
    strength.push([s, i])
    frames.push({ phase: 'count', activeLine: L('const s = mat[i]'), pythonLine: P('strength.append'), snapshot: snap({ current: i }),
      message: `Row ${i} has ${s} soldier(s).` })
  }
  const sorted = [...strength].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  frames.push({ phase: 'sort', activeLine: L('strength.sort('), pythonLine: P('strength.sort'), snapshot: snap({ sorted: sorted.map(([s, i]) => i) }),
    message: `Sort by strength, then by row index: ${sorted.map(([, i]) => i).join(', ')}.` })
  const picked = []
  for (let t = 0; t < k; t++) {
    picked.push(sorted[t][1])
    frames.push({ phase: 'pick', activeLine: L('slice(0, k)'), pythonLine: P('strength[:k]'), snapshot: snap({ sorted: sorted.map(([, i]) => i), picked: [...picked] }),
      message: `Take row ${sorted[t][1]} (${sorted[t][0]} soldier(s)).` })
  }
  const result = picked
  frames.push({ phase: 'done', activeLine: L('return strength.slice'), pythonLine: P('return [i'), snapshot: snap({ sorted: sorted.map(([, i]) => i), picked: [...picked], chosen: [...picked] }),
    message: `Return [${result.join(', ')}].`, result })
  return { input: { mat, k }, result, frames }
}

export const code = `function kWeakestRows(mat, k) {
  const strength = []
  for (let i = 0; i < mat.length; i++) {
    const s = mat[i].reduce((a, b) => a + b, 0)
    strength.push([s, i])
  }
  strength.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  return strength.slice(0, k).map(([, i]) => i)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def k_weakest_rows(mat, k):
    strength = []
    for i, row in enumerate(mat):
        strength.append((sum(row), i))
    strength.sort()
    return [i for _, i in strength[:k]]
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
