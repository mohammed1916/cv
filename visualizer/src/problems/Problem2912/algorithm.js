const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, m, k, source and destination.')
  const { n, m, k, source, destination } = input
  if (![n, m].every(v => Number.isInteger(v) && v >= 1 && v <= 8)) throw new Error('n and m are integers from 1 to 8.')
  if (!Number.isInteger(k) || k < 0 || k > 12) throw new Error('k is an integer from 0 to 12.')
  const onGrid = p => Array.isArray(p) && p.length === 2 && Number.isInteger(p[0]) && Number.isInteger(p[1]) && p[0] >= 1 && p[0] <= n && p[1] >= 1 && p[1] <= m
  if (!onGrid(source) || !onGrid(destination)) throw new Error('source and destination are one-based [row, column] cells on the grid.')
  return { n, m, k, source, destination }
}

// Every cell is classified against the destination: D (the destination), R (same row), C (same column), O (other).
// Those four classes are enough because all cells of one class have the same number of moves into each class.
export function buildTrace({ n, m, k, source, destination }) {
  const frames = []
  let counts = { d: 0, r: 0, c: 0, o: 0 }
  let sourceClass = 'O'
  if (source[0] === destination[0] && source[1] === destination[1]) sourceClass = 'D'
  else if (source[0] === destination[0]) sourceClass = 'R'
  else if (source[1] === destination[1]) sourceClass = 'C'
  counts[sourceClass.toLowerCase()] = 1
  const pick = () => ({ ...counts })
  frames.push({ phase: 'start', pythonLine: 3, activeLine: L('classify the source'), move: 0, sourceClass, counts: pick(), message: `The source is class ${sourceClass} relative to the destination; it starts with one way.` })

  for (let t = 1; t <= k; t++) {
    const { d, r, c, o } = counts
    counts = {
      d: (r + c) % MOD,
      r: (d * Math.max(m - 1, 0) + r * Math.max(m - 2, 0) + o) % MOD,
      c: (d * Math.max(n - 1, 0) + c * Math.max(n - 2, 0) + o) % MOD,
      o: (r * Math.max(n - 1, 0) + c * Math.max(m - 1, 0) + o * Math.max(m + n - 4, 0)) % MOD,
    }
    frames.push({ phase: 'move', pythonLine: 13, activeLine: L('new destination count'), move: t, sourceClass, counts: pick(),
      message: `After move ${t}: destination ${counts.d}, row ${counts.r}, column ${counts.c}, other ${counts.o} (ways per class).` })
  }
  frames.push({ phase: 'done', pythonLine: 18, activeLine: L('return the destination count'), move: k, sourceClass, counts: pick(),
    message: `After ${k} moves the destination holds ${counts.d} ways modulo 1000000007.` })
  return { input: { n, m, k, source, destination }, result: counts.d, frames }
}

export const code = `ways to reach the destination in exactly k moves
  classify the source as destination, row, column or other
  counts hold one for the source class
  repeat k times
    new destination count is row count plus column count
    new row count is destination times (m minus 1), row times (m minus 2), plus other
    new column count is destination times (n minus 1), column times (n minus 2), plus other
    new other count is row times (n minus 1), column times (m minus 1), other times (n plus m minus 4)
  return the destination count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `MOD = 1000000007
def ways_to_destination(n, m, k, source, destination):
    if source == destination:
        d, r, c, o = 1, 0, 0, 0
    elif source[0] == destination[0]:
        d, r, c, o = 0, 1, 0, 0
    elif source[1] == destination[1]:
        d, r, c, o = 0, 0, 1, 0
    else:
        d, r, c, o = 0, 0, 0, 1
    for _ in range(k):
        d, r, c, o = (
            (r + c) % MOD,
            (d * max(m - 1, 0) + r * max(m - 2, 0) + o) % MOD,
            (d * max(n - 1, 0) + c * max(n - 2, 0) + o) % MOD,
            (r * max(n - 1, 0) + c * max(m - 1, 0) + o * max(m + n - 4, 0)) % MOD,
        )
    return d
`
