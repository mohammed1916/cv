export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || !Array.isArray(o.grid)) throw new Error('Use an object with a grid array of rows.')
  const { grid } = o
  if (grid.length < 1 || grid.length > 4) throw new Error('grid must have 1 to 4 rows.')
  if (!grid.every(row => Array.isArray(row) && row.length >= 1 && row.length <= 4 && row.length === grid[0].length)) throw new Error('Rows must be non-empty and the same length, at most 4 wide.')
  if (grid.some(row => row.some(v => !Number.isInteger(v) || v < 1 || v > 20))) throw new Error('Values are integers from 1 to 20.')
  return { grid }
}

export function buildTrace({ grid }) {
  const rows = grid.length
  const rowsOf = new Map()
  grid.forEach((row, r) => row.forEach(v => {
    if (!rowsOf.has(v)) rowsOf.set(v, new Set())
    rowsOf.get(v).add(r)
  }))
  const values = [...rowsOf.keys()].sort((a, b) => a - b)
  const size = 1 << rows
  let best = new Array(size).fill(-Infinity)
  best[0] = 0
  const frames = [{ phase: 'start', activeLine: L('set best[0] to zero'), value: null, best: best.slice(), total: 0, message: `Process the ${values.length} distinct values in increasing order.` }]
  for (const v of values) {
    const next = best.slice()
    for (let mask = 0; mask < size; mask++) {
      if (best[mask] === -Infinity) continue
      for (const r of rowsOf.get(v)) {
        if (mask & (1 << r)) continue
        const m2 = mask | (1 << r)
        next[m2] = Math.max(next[m2], best[mask] + v)
      }
    }
    best = next
    frames.push({ phase: 'value', activeLine: L('for each distinct value v'), value: v, best: best.slice(), total: Math.max(...best), message: `Value ${v} can be taken from rows ${[...rowsOf.get(v)].join(', ')}.` })
  }
  const result = Math.max(...best)
  frames.push({ phase: 'done', activeLine: L('return the largest'), value: null, best: best.slice(), total: result, message: `Maximum score: ${result}.` })
  return { input: { grid }, result, frames }
}

export const code = `maximum score of cells with distinct rows and distinct values
  let best[mask] be the largest score using exactly the rows in mask, with best[0] equal to zero and others unreachable
  set best[0] to zero and every other entry to unreachable
  for each distinct value v in increasing order
    copy best into next
    for each mask with a reachable score
      for each row r that contains v and is not in mask
        set next[mask with r] to the larger of itself and best[mask] plus v
    set best to next
  return the largest entry of best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_score(grid):
    rows = len(grid)
    rows_of = {}
    for r, row in enumerate(grid):
        for v in row:
            rows_of.setdefault(v, set()).add(r)

    NEG = float('-inf')
    best = [NEG] * (1 << rows)
    best[0] = 0
    for v in sorted(rows_of):
        nxt = best[:]
        for mask in range(1 << rows):
            if best[mask] == NEG:
                continue
            for r in rows_of[v]:
                if mask >> r & 1:
                    continue
                m2 = mask | 1 << r
                nxt[m2] = max(nxt[m2], best[mask] + v)
        best = nxt
    return max(best)
`
