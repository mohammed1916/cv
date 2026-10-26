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

export const code = `def maxCount(m, n, ops):
    for a, b in ops:
        m, n = min(m, a), min(n, b)
    return m * n`.split('\n').map((text, index) => ({ line: index + 1, text }))
