export const phases = [
  { id: 'start', label: 'Start', description: 'Create one counter for every row and every column. Nothing has been incremented yet.' },
  { id: 'apply', label: 'Apply operations', description: 'Each operation adds one to a row counter and one to a column counter, so we never touch the matrix cells themselves.' },
  { id: 'scan', label: 'Count odd cells', description: 'A cell equals rows[r] + cols[c]. That sum is odd exactly when the two counters have different parity.' },
  { id: 'done', label: 'Complete', description: 'Return the number of odd cells in the matrix.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"m": 2, "n": 3, "indices": [[0, 1]]}.')
  const { m, n, indices } = input
  if (!Number.isInteger(m) || m < 1 || m > 8) throw new Error('m is an integer from 1 to 8 in this view.')
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n is an integer from 1 to 8 in this view.')
  if (!Array.isArray(indices) || indices.length < 1 || indices.length > 12) throw new Error('indices holds 1 to 12 [row, column] pairs.')
  for (const pair of indices) {
    if (!Array.isArray(pair) || pair.length !== 2 || !Number.isInteger(pair[0]) || !Number.isInteger(pair[1])
      || pair[0] < 0 || pair[0] >= m || pair[1] < 0 || pair[1] >= n) {
      throw new Error(`Each index must be [row, column] inside the ${m} by ${n} matrix.`)
    }
  }
  return { m, n, indices }
}

// Line lookups keep every frame pointed at the real line of the pseudocode and the Python below.
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ m, n, indices }) {
  const rows = Array(m).fill(0)
  const cols = Array(n).fill(0)
  const snap = (extra = {}) => ({ rows: [...rows], cols: [...cols], m, n, ...extra })
  const frames = [{
    phase: 'start', activeLine: L('const rows = Array(m)'), pythonLine: P('rows = [0] * m'), snapshot: snap(),
    message: `A ${m} by ${n} matrix starts at zero. We will apply ${indices.length} operations using one counter per row and per column.`,
  }]

  indices.forEach(([r, c], i) => {
    rows[r] += 1
    cols[c] += 1
    frames.push({
      phase: 'apply', activeLine: L('rows[r] += 1'), pythonLine: P('rows[r] += 1'),
      snapshot: snap({ applied: i + 1, focus: [r, c] }),
      message: `Operation ${i + 1} adds one to row ${r} and column ${c}. Row ${r} now holds ${rows[r]} and column ${c} now holds ${cols[c]}.`,
    })
  })

  let count = 0
  for (let r = 0; r < m; r++) {
    let inRow = 0
    for (let c = 0; c < n; c++) if ((rows[r] + cols[c]) % 2 === 1) inRow++
    count += inRow
    frames.push({
      phase: 'scan', activeLine: L('if ((rows[r] + cols[c])'), pythonLine: P('if (rows[r] + cols[c])'),
      snapshot: snap({ scanRow: r, rowOdd: inRow, count }),
      message: `Row ${r} has counter ${rows[r]}. Its cells are odd where the column counter has the opposite parity, so this row contributes ${inRow}. Running total ${count}.`,
    })
  }

  frames.push({
    phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), snapshot: snap({ count }),
    message: `Return ${count}: the number of odd cells after every operation.`,
  })
  return { input: { m, n, indices }, result: count, frames }
}

export const code = [
  "function oddCells(m, n, indices) {",
  "  const rows = Array(m).fill(0)",
  "  const cols = Array(n).fill(0)",
  "  for (const [r, c] of indices) {",
  "    rows[r] += 1",
  "    cols[c] += 1",
  "  }",
  "  let count = 0",
  "  for (let r = 0; r < m; r++) {",
  "    for (let c = 0; c < n; c++) {",
  "      if ((rows[r] + cols[c]) % 2 === 1) count += 1",
  "    }",
  "  }",
  "  return count",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def odd_cells(m, n, indices):
    rows = [0] * m
    cols = [0] * n
    for r, c in indices:
        rows[r] += 1
        cols[c] += 1
    count = 0
    for r in range(m):
        for c in range(n):
            if (rows[r] + cols[c]) % 2 == 1:
                count += 1
    return count
`
