const MOD = 1000000007
const COLOURS = ['R', 'G', 'B']
const MAX_ROWS = 3
const MAX_COLUMNS = 6

export function parseInput(text) {
  const data = JSON.parse(text)
  const { m, n } = data ?? {}
  if (!Number.isInteger(m) || m < 1 || m > MAX_ROWS) throw new Error(`m must be an integer from 1 to ${MAX_ROWS}.`)
  if (!Number.isInteger(n) || n < 1 || n > MAX_COLUMNS) throw new Error(`n must be an integer from 1 to ${MAX_COLUMNS}.`)
  return { m, n }
}

export const code = `count colourings(m, n)
  list every column of m cells with three colours where no two cells above each other match
  set ways[column] to 1 for every column (the first column)
  repeat n-1 times
    for each column q, set next[q] to the sum of ways[p] over columns p that match q in no row
    replace ways with next
  return the sum of ways, modulo the prime`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Only the column pattern matters for the next column, so the DP runs over the valid patterns of one column.
export function buildTrace({ m, n }) {
  const patterns = []
  const build = prefix => {
    if (prefix.length === m) { patterns.push(prefix); return }
    for (let c = 0; c < 3; c++) {
      if (prefix.length && prefix[prefix.length - 1] === c) continue
      build([...prefix, c])
    }
  }
  build([])
  const label = p => p.map(c => COLOURS[c]).join('')
  let ways = patterns.map(() => 1)
  const show = () => [ways.slice()]
  const frames = [{ phase: 'start', column: 0, table: show(), activeLine: L('list every column'), message: `${patterns.length} valid column pattern(s) with ${m} cell(s).` }]
  for (let col = 1; col < n; col++) {
    const next = patterns.map(q => patterns.reduce((sum, p, index) => (p.every((c, row) => c !== q[row]) ? (sum + ways[index]) % MOD : sum), 0))
    ways = next
    frames.push({ phase: 'column', column: col, table: show(), activeLine: L('for each column q'), message: `Column ${col + 1}: each pattern counts the previous columns that differ in every row.` })
  }
  const result = ways.reduce((a, b) => (a + b) % MOD, 0)
  frames.push({ phase: 'done', column: n - 1, table: show(), activeLine: L('return the sum of ways'), result, message: `Colourings of the ${m} by ${n} grid: ${result}.` })
  return { input: { m, n }, result, labels: patterns.map(label), frames }
}

export const python = `def color_the_grid(m, n):
    MOD = 1000000007
    patterns = []

    def build(prefix):
        if len(prefix) == m:
            patterns.append(tuple(prefix))
            return
        for c in range(3):
            if not prefix or prefix[-1] != c:
                build(prefix + [c])

    build([])
    ways = {p: 1 for p in patterns}
    for _ in range(n - 1):
        nxt = {}
        for q in patterns:
            nxt[q] = sum(ways[p] for p in patterns if all(p[i] != q[i] for i in range(m))) % MOD
        ways = nxt
    return sum(ways.values()) % MOD
`
