export const python = `from math import comb

def manhattanDistances(m, n, k):
    MOD = 10**9 + 7
    cells = m * n
    def ordered_gap_sum(length):
        return sum(2 * d * (length - d) for d in range(1, length))
    row_part = ordered_gap_sum(m) * n * n
    col_part = ordered_gap_sum(n) * m * m
    pair_distance_total = (row_part + col_part) // 2
    ways = comb(cells - 2, k - 2)
    return pair_distance_total * ways % MOD
`

const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const code = [
  'FUNCTION manhattanDistances(m, n, k)',
  'cells ← m × n',
  'rowSum ← sum over row gaps d of 2 × d × (m − d), times n²',
  'colSum ← sum over column gaps d of 2 × d × (n − d), times m²',
  'pairTotal ← (rowSum + colSum) / 2',
  'ways ← C(cells − 2, k − 2)',
  'RETURN pairTotal × ways mod 1000000007',
].map((text, index) => ({ line: index + 1, text }))

export function parseInput(text) {
  const data = typeof text === 'string' ? JSON.parse(text) : text
  if (!data || typeof data !== 'object') throw new Error('Use a JSON object with m, n and k.')
  const { m, n, k } = data
  if (![m, n, k].every(Number.isInteger)) throw new Error('m, n and k must be integers.')
  if (m < 1 || n < 1) throw new Error('m and n must be at least 1.')
  if (m * n > 36) throw new Error('The visualization caps m * n at 36 cells.')
  if (m * n < 2) throw new Error('The grid needs at least 2 cells.')
  if (k < 2 || k > m * n) throw new Error('k must be between 2 and m * n.')
  return { m, n, k }
}

const gapTerm = (length, d) => 2n * BigInt(d) * BigInt(length - d)

function combBig(a, b) {
  if (b < 0 || b > a) return 0n
  let r = 1n
  for (let i = 1; i <= b; i++) r = (r * BigInt(a - b + i)) / BigInt(i)
  return r
}

export function buildTrace(input) {
  const { m, n, k } = input
  const cells = m * n
  const base = { axis: null, length: 0, d: -1, rowGap: 0n, colGap: 0n, pairTotal: null, ways: null, result: null }
  const frames = []
  frames.push({ ...base, phase: 'setup', activeLine: 2, pythonLine: P('cells = m * n'),
    message: `The grid has ${cells} cells and ${k} pieces. Every pair of cells appears together in C(${cells - 2}, ${k - 2}) arrangements.` })
  let rowGap = 0n
  for (let d = 1; d < m; d++) {
    rowGap += gapTerm(m, d)
    frames.push({ ...base, phase: 'rows', activeLine: 3, pythonLine: P('return sum(2'), axis: 'rows', length: m, d, rowGap,
      message: `Row gap ${d} contributes ${gapTerm(m, d)} to the ordered row-gap sum, now ${rowGap}.` })
  }
  let colGap = 0n
  for (let d = 1; d < n; d++) {
    colGap += gapTerm(n, d)
    frames.push({ ...base, phase: 'columns', activeLine: 4, pythonLine: P('return sum(2'), axis: 'columns', length: n, d, rowGap, colGap,
      message: `Column gap ${d} contributes ${gapTerm(n, d)} to the ordered column-gap sum, now ${colGap}.` })
  }
  const rowPart = rowGap * BigInt(n * n)
  const colPart = colGap * BigInt(m * m)
  const pairTotal = (rowPart + colPart) / 2n
  frames.push({ ...base, phase: 'pairs', activeLine: 5, pythonLine: P('pair_distance_total ='), rowGap, colGap, pairTotal,
    message: `Sum over unordered cell pairs of their distances: ${pairTotal}.` })
  const ways = combBig(cells - 2, k - 2)
  frames.push({ ...base, phase: 'ways', activeLine: 6, pythonLine: P('ways = comb'), pairTotal, ways,
    message: `Each pair appears in C(${cells - 2}, ${k - 2}) = ${ways} arrangements.` })
  const result = Number((pairTotal * ways) % 1000000007n)
  frames.push({ ...base, phase: 'done', activeLine: 7, pythonLine: P('return pair_distance'), pairTotal, ways, result,
    message: `Return ${pairTotal} × ${ways} mod 1000000007 = ${result}.` })
  return { input, result, frames }
}
