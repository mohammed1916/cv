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
  const pyFor = { start: P(`grid = [[0] * k`), graph: P(`adj = [[] for`), rows: P(`order.append(v)`), cols: P(`order.append(v)`), place: P(`grid[row_of[v]][col_of[v]] = v`), done: P(`return grid`) }
  const snap = (phase, activeLine, message, value = null, pythonLine = pyFor[phase]) => frames.push({
    phase, activeLine, value, pythonLine, rows: [...rows], cols: [...cols], grid: grid.map(r => [...r]), message,
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
  const fail = (activeLine, message, pythonLine) => { snap('fail', activeLine, message, null, pythonLine); return { input, result: [], frames } }

  snap('start', L('const grid = Array.from'), 'Start with a k by k grid of zeros.')
  snap('graph', L('const adj = Array.from'), `${rowEdges.length} row conditions and ${colEdges.length} column conditions.`)
  if (!topo('rows', rowEdges, rows, L('const rows = topologicalOrder'), 'Row value')) {
    return fail(L('const rows = topologicalOrder'), 'The row conditions form a cycle, so no matrix exists. Return empty.', P(`return []`))
  }
  if (!topo('cols', colEdges, cols, L('const cols = topologicalOrder'), 'Column value')) {
    return fail(L('const cols = topologicalOrder'), 'The column conditions form a cycle, so no matrix exists. Return empty.', P(`if cols is None:`) + 1)
  }
  for (let v = 1; v <= k; v++) {
    grid[rows.indexOf(v)][cols.indexOf(v)] = v
    snap('place', L('grid[rows.indexOf(v)]'), `Value ${v} goes to row ${rows.indexOf(v)} and column ${cols.indexOf(v)}.`, v)
  }
  snap('done', L('return grid'), 'The grid satisfies every row and column condition.')
  return { input, result: grid, frames }
}

export const code = `function buildMatrix(k, rowConditions, colConditions) {
  const grid = Array.from({ length: k }, () => Array(k).fill(0)) // create a k by k grid of zeros
  const rows = topologicalOrder(k, rowConditions) // topologically sort the rows
  if (rows === null) return []
  const cols = topologicalOrder(k, colConditions) // topologically sort the columns
  if (cols === null) return []
  for (let v = 1; v <= k; v++) {
    grid[rows.indexOf(v)][cols.indexOf(v)] = v // put v in the row and column of its place
  }
  return grid // return the grid
}

function topologicalOrder(k, edges) {
  const adj = Array.from({ length: k + 1 }, () => []) // build a graph: above -> below
  const indegree = Array(k + 1).fill(0)
  for (const [above, below] of edges) {
    adj[above].push(below)
    indegree[below]++
  }
  const ready = []
  for (let v = 1; v <= k; v++) if (indegree[v] === 0) ready.push(v)
  const order = []
  while (ready.length) {
    ready.sort((x, y) => x - y)
    const v = ready.shift()
    order.push(v)
    for (const w of adj[v]) {
      indegree[w]--
      if (indegree[w] === 0) ready.push(w)
    }
  }
  return order.length === k ? order : null
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

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
