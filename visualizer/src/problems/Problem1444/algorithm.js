export const phases = [
  { id: 'setup', label: 'Count apples', description: 'Build prefix sums so the apples in any rectangle take constant time to count.' },
  { id: 'base', label: 'One piece', description: 'With one piece left, a region works only when it contains an apple.' },
  { id: 'cell', label: 'Cut options', description: 'For the region starting at this cell, the first cut removes a top or left piece that must hold an apple.' },
  { id: 'cut', label: 'Sum cuts', description: 'Add the ways that remain after each valid first cut, using the table for one fewer piece.' },
  { id: 'done', label: 'Result', description: 'Return the ways for the whole pizza, taken modulo 1000000007.' },
]

export const code = `function countWays(pizza, k):
    rows, cols = size(pizza)
    prefix = apple prefix sums of pizza
    ways = one-piece table: 1 where the region from (r, c) has an apple
    for pieces from 2 to k:
        next = new table
        for r from 0 to rows - 1:
            for c from 0 to cols - 1:
                total = 0
                for r2 from r + 1 to rows - 1:
                    if apples(r, c, r2, cols) > 0: total += ways[r2][c]
                for c2 from c + 1 to cols - 1:
                    if apples(r, c, rows, c2) > 0: total += ways[r][c2]
                next[r][c] = total mod 1000000007
        ways = next
    return ways[0][0]`

export const python = `MOD = 1_000_000_007

def count_ways(pizza, k):
    rows, cols = len(pizza), len(pizza[0])
    prefix = apple_prefix_sums(pizza)
    def apples(r1, c1, r2, c2): return prefix[r2][c2] - prefix[r1][c2] - prefix[r2][c1] + prefix[r1][c1]
    ways = [[1 if apples(r, c, rows, cols) > 0 else 0 for c in range(cols)] for r in range(rows)]
    for pieces in range(2, k + 1):
        nxt = [[0] * cols for _ in range(rows)]
        for r in range(rows):
            for c in range(cols):
                total = 0
                for r2 in range(r + 1, rows):
                    if apples(r, c, r2, cols) > 0: total += ways[r2][c]
                for c2 in range(c + 1, cols):
                    if apples(r, c, rows, c2) > 0: total += ways[r][c2]
                nxt[r][c] = total % MOD
        ways = nxt
    return ways[0][0]`

const lineOf = (source, fragment) => source.split('\n').findIndex(line => line.includes(fragment)) + 1
const C = fragment => lineOf(code, fragment)
const P = fragment => lineOf(python, fragment)
const MOD = 1000000007

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"pizza":["..A","A..","..."],"k":2}.') }
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.pizza) || !Number.isInteger(obj.k)) throw new Error('Use {"pizza": [rows of A and .], "k": number of pieces}.')
  const { pizza, k } = obj
  if (pizza.length < 1 || pizza.length > 50) throw new Error('The pizza has 1 to 50 rows.')
  const cols = String(pizza[0]).length
  if (cols < 1 || cols > 50) throw new Error('Each row has 1 to 50 characters.')
  pizza.forEach(row => {
    if (typeof row !== 'string' || row.length !== cols || !/^[A.]+$/.test(row)) throw new Error('Every row must have the same length and use only A (apple) and . (empty).')
  })
  if (!pizza.some(row => row.includes('A'))) throw new Error('The pizza needs at least one apple.')
  if (k < 1 || k > 10) throw new Error('k must be from 1 to 10.')
  return { pizza, k }
}

export function buildTrace({ pizza, k }) {
  const R = pizza.length
  const Cc = pizza[0].length
  const prefix = Array.from({ length: R + 1 }, () => Array(Cc + 1).fill(0))
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < Cc; c++) {
      prefix[r + 1][c + 1] = prefix[r][c + 1] + prefix[r + 1][c] - prefix[r][c] + (pizza[r][c] === 'A' ? 1 : 0)
    }
  }
  const apples = (r1, c1, r2, c2) => prefix[r2][c2] - prefix[r1][c2] - prefix[r2][c1] + prefix[r1][c1]
  const frames = []
  const add = (phase, c, p, message, snap) => frames.push({ phase, activeLine: C(c), pythonLine: P(p), message, snapshot: { R, Cc, pizza, pieces: 1, r: null, c: null, value: null, table: null, ...snap } })

  add('setup', 'prefix = ', 'prefix = ', `Count apples in every top-left rectangle. The pizza has ${R} rows and ${Cc} columns.`, {})
  let ways = Array.from({ length: R }, (_, r) => Array.from({ length: Cc }, (_, c) => (apples(r, c, R, Cc) > 0 ? 1 : 0)))
  add('base', 'ways = one-piece', 'ways = [[1', 'With one piece, a region from each cell is valid only if it still holds an apple.', { table: ways })

  for (let p = 2; p <= k; p++) {
    const next = Array.from({ length: R }, () => Array(Cc).fill(0))
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < Cc; c++) {
        const prev = ways
        add('cell', 'total = 0', 'total = 0', `Pieces ${p}, cell (${r}, ${c}): look at every first cut from this corner.`,
          { pieces: p, r, c, table: prev })
        let top = 0
        for (let r2 = r + 1; r2 < R; r2++) if (apples(r, c, r2, Cc) > 0) top += prev[r2][c]
        let left = 0
        for (let c2 = c + 1; c2 < Cc; c2++) if (apples(r, c, R, c2) > 0) left += prev[r][c2]
        const total = (top + left) % MOD
        next[r][c] = total
        add('cut', 'next[r][c] = ', 'nxt[r][c] = ', `Cell (${r}, ${c}): horizontal cuts add ${top}, vertical cuts add ${left}, so ${total} ways.`,
          { pieces: p, r, c, value: total, table: prev })
      }
    }
    ways = next
  }
  add('done', 'return ways[0][0]', 'return ways[0][0]', `The whole pizza has ${ways[0][0]} ways to make ${k} pieces with apples in each.`, { pieces: k, r: 0, c: 0, value: ways[0][0], table: ways })
  return { input: { pizza, k }, result: ways[0][0], frames }
}
