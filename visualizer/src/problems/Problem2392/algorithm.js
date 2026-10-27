export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys k, row_conditions and col_conditions.')
  const { k, row_conditions: rows, col_conditions: cols } = input
  if (!Number.isInteger(k) || k < 1 || k > 6) throw new Error('k must be an integer from 1 to 6.')
  for (const [name, list] of [['row_conditions', rows], ['col_conditions', cols]]) {
    if (!Array.isArray(list) || list.length > 8) throw new Error(`${name} must be a list of at most 8 pairs.`)
    list.forEach(pair => {
      if (!Array.isArray(pair) || pair.length !== 2 || pair.some(v => !Number.isInteger(v) || v < 1 || v > k) || pair[0] === pair[1]) {
        throw new Error(`${name} pairs must be two different values from 1 to k.`)
      }
    })
  }
  return { k, row_conditions: rows, col_conditions: cols }
}

export function buildTrace(input) {
  const { k, row_conditions: rowEdges, col_conditions: colEdges } = input
  const frames = []
  const rows = []
  const cols = []
  const grid = Array.from({ length: k }, () => Array(k).fill(0))
  const snap = (phase, activeLine, message, value = null) => frames.push({
    phase, activeLine, value, rows: [...rows], cols: [...cols], grid: grid.map(r => [...r]), message,
  })
  const topo = (phase, edges, out, activeLine, label) => {
    const adj = Array.from({ length: k + 1 }, () => [])
    const indeg = Array(k + 1).fill(0)
    for (const [above, below] of edges) { adj[above].push(below); indeg[below]++ }
    const ready = []
    for (let v = 1; v <= k; v++) if (indeg[v] === 0) ready.push(v)
    while (ready.length) {
      ready.sort((x, y) => x - y)
      const v = ready.shift()
      out.push(v)
      snap(phase, activeLine, `${label} ${v} has no unmet conditions, so it comes next.`, v)
      for (const w of adj[v]) { indeg[w]--; if (indeg[w] === 0) ready.push(w) }
    }
    return out.length === k ? out : null
  }
  const fail = (activeLine, message) => { snap('fail', activeLine, message); return { input, result: [], frames } }

  snap('start', L('create a k by k grid'), 'Start with a k by k grid of zeros.')
  snap('graph', L('build a graph of row conditions'), `${rowEdges.length} row conditions and ${colEdges.length} column conditions.`)
  if (!topo('rows', rowEdges, rows, L('topologically sort the rows'), 'Row value')) {
    return fail(L('topologically sort the rows'), 'The row conditions form a cycle, so no matrix exists. Return empty.')
  }
  if (!topo('cols', colEdges, cols, L('topologically sort the columns'), 'Column value')) {
    return fail(L('topologically sort the columns'), 'The column conditions form a cycle, so no matrix exists. Return empty.')
  }
  for (let v = 1; v <= k; v++) {
    grid[rows.indexOf(v)][cols.indexOf(v)] = v
    snap('place', L('put v in the row'), `Value ${v} goes to row ${rows.indexOf(v)} and column ${cols.indexOf(v)}.`, v)
  }
  snap('done', L('return the grid'), 'The grid satisfies every row and column condition.')
  return { input, result: grid, frames }
}

export const code = `create a k by k grid of zeros
build a graph of row conditions from each row pair
build a graph of column conditions from each column pair
topologically sort the rows; if a cycle exists, return empty
topologically sort the columns; if a cycle exists, return empty
for each value v from 1 to k
  put v in the row at its place in the row order
  and in the column at its place in the column order
return the grid`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def build_matrix(k, row_conditions, col_conditions):
    def topo(edges):
        adj = [[] for _ in range(k + 1)]
        indeg = [0] * (k + 1)
        for above, below in edges:
            adj[above].append(below)
            indeg[below] += 1
        ready = [v for v in range(1, k + 1) if indeg[v] == 0]
        order = []
        while ready:
            ready.sort()
            v = ready.pop(0)
            order.append(v)
            for w in adj[v]:
                indeg[w] -= 1
                if indeg[w] == 0:
                    ready.append(w)
        return order if len(order) == k else None

    rows = topo(row_conditions)
    if rows is None:
        return []
    cols = topo(col_conditions)
    if cols is None:
        return []
    row_of = {v: i for i, v in enumerate(rows)}
    col_of = {v: i for i, v in enumerate(cols)}
    grid = [[0] * k for _ in range(k)]
    for v in range(1, k + 1):
        grid[row_of[v]][col_of[v]] = v
    return grid
`
