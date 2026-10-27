export function parseInput(text) {
  const data = JSON.parse(text)
  const { m, n, ops } = data ?? {}
  if (![m, n].every(v => Number.isInteger(v) && v >= 1 && v <= 40000) || !Array.isArray(ops) || ops.length > 10000) throw new Error('Enter {"m":rows,"n":cols,"ops":[[a,b],...]} with 1 ≤ m, n ≤ 40,000 and up to 10,000 operations.')
  for (const [a, b] of ops) if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || a > m || b < 1 || b > n) throw new Error('Each operation [a,b] must satisfy 1 ≤ a ≤ m and 1 ≤ b ≤ n.')
  return { m, n, ops }
}

export function buildTrace({ m, n, ops }) {
  let rows = m, cols = n
  const frames = [{ phase: 'start', rows, cols, op: null, activeLine: 2, message: `Start with the full ${m}×${n} matrix.` }]
  ops.forEach(([a, b], index) => {
    const nextRows = Math.min(rows, a), nextCols = Math.min(cols, b)
    const changed = nextRows !== rows || nextCols !== cols
    rows = nextRows; cols = nextCols
    frames.push({ phase: 'apply', rows, cols, op: index, opValue: [a, b], changed, activeLine: 4,
      message: changed ? `Operation [${a}, ${b}] shrinks the top-left block to ${rows}×${cols}.` : `Operation [${a}, ${b}] does not change the max block.` })
  })
  const result = rows * cols
  frames.push({ phase: 'done', rows, cols, op: null, result, activeLine: 6, message: `Maximum-valued cells: ${rows} × ${cols} = ${result}.` })
  return { input: { m, n, ops }, result, frames }
}

export const code = `start the common rectangle at m rows and n columns
for each operation [a, b] in order
  shrink the rows to the smaller of the rows and a
  shrink the columns to the smaller of the columns and b
  the rectangle now covers exactly the cells that received every increment so far
return the rows times the columns`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The scan-family visualizer reports its own step numbers (1 setup, 4 update, 5 return).
export const LINE_MAP = { 1: 1, 4: 4, 5: 6 }

export const python = `def max_count(m, n, ops):
    rows, cols = m, n
    for a, b in ops:
        rows = min(rows, a)
        cols = min(cols, b)
    return rows * cols`
