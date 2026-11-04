export const phases = [
  { id: 'setup', label: 'Tally', description: 'Count the ones in every row and every column.' },
  { id: 'scan', label: 'Scan cells', description: 'Visit each cell in row-major order.' },
  { id: 'check', label: 'Check cell', description: 'A cell is special when it holds 1 and both its row and column tallies are exactly 1.' },
  { id: 'record', label: 'Count it', description: 'Add one to the running count for each special cell.' },
  { id: 'done', label: 'Result', description: 'Return the number of special cells.' },
]

export const code = `function numSpecial(mat) {
  const m = mat.length, n = mat[0].length;
  const rows = mat.map(row => row.reduce((a, b) => a + b, 0));
  const cols = Array.from({ length: n }, (_, j) => mat.reduce((a, row) => a + row[j], 0));
  let count = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (mat[i][j] === 1 && rows[i] === 1 && cols[j] === 1) count++;
    }
  }
  return count;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def numSpecial(mat):
    m, n = len(mat), len(mat[0])
    rows = [sum(row) for row in mat]
    cols = [sum(mat[i][j] for i in range(m)) for j in range(n)]
    count = 0
    for i in range(m):
        for j in range(n):
            if mat[i][j] == 1 and rows[i] == 1 and cols[j] == 1:
                count += 1
    return count`

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 8, 10: 9, 11: 10, 12: 10 }

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch (error) { throw new Error(`Input must be valid JSON: ${error.message}`) }
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"mat": [[1,0],[0,1]]}.')
  const { mat } = input
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 12) throw new Error('mat must have between 1 and 12 rows.')
  const width = Array.isArray(mat[0]) ? mat[0].length : 0
  if (width < 1 || width > 12) throw new Error('Each row must have between 1 and 12 columns.')
  if (!mat.every(row => Array.isArray(row) && row.length === width && row.every(v => v === 0 || v === 1))) {
    throw new Error(`Every row must have ${width} entries, each 0 or 1.`)
  }
  return { mat }
}

export function buildTrace({ mat }) {
  const m = mat.length
  const n = mat[0].length
  const rows = mat.map(row => row.reduce((a, b) => a + b, 0))
  const cols = Array.from({ length: n }, (_, j) => mat.reduce((a, row) => a + row[j], 0))
  const special = []
  const snap = (extra = {}) => ({ rows: rows.slice(), cols: cols.slice(), special: special.map(p => p.slice()), i: -1, j: -1, ...extra })
  const frames = []
  frames.push({ phase: 'setup', activeLine: 3, message: `Row tallies are ${rows.join(', ')}; column tallies are ${cols.join(', ')}.`, snapshot: snap() })
  frames.push({ phase: 'setup', activeLine: 4, message: 'Column tallies are ready. Next, check each cell against them.', snapshot: snap() })
  frames.push({ phase: 'scan', activeLine: 5, message: 'Start with count = 0.', snapshot: snap() })
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const isOne = mat[i][j] === 1
      const ok = isOne && rows[i] === 1 && cols[j] === 1
      frames.push({ phase: 'check', activeLine: 8, message: `Cell (${i}, ${j}) holds ${mat[i][j]}. ${!isOne ? 'Not a 1, so it cannot be special.' : `Row ${i} has ${rows[i]} one(s) and column ${j} has ${cols[j]}.`}`, snapshot: snap({ i, j }) })
      if (ok) {
        special.push([i, j])
        frames.push({ phase: 'record', activeLine: 8, message: `Cell (${i}, ${j}) is the only 1 in its row and column, so count it.`, snapshot: snap({ i, j }) })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: 11, message: `Return ${special.length}.`, snapshot: snap() })
  return { input: { mat }, result: special.length, frames }
}
