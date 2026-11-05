const MOD = 1000000007
const CELL_ROW = /^[.#]+$/
const MAX_SIDE = 8

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with grid and d.')
  const { grid, d } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_SIDE) throw new Error(`grid has 1 to ${MAX_SIDE} rows in the visualization.`)
  if (typeof grid[0] !== 'string' || grid[0].length < 1 || grid[0].length > MAX_SIDE) throw new Error(`Each row has 1 to ${MAX_SIDE} characters in the visualization.`)
  const cols = grid[0].length
  for (const row of grid) {
    if (typeof row !== 'string' || row.length !== cols || !CELL_ROW.test(row)) throw new Error('Every row has the same length and uses only "." and "#".')
  }
  if (!Number.isInteger(d) || d < 1 || d > 750) throw new Error('d is an integer from 1 to 750.')
  return { grid: [...grid], d }
}

const mod = x => ((x % MOD) + MOD) % MOD

// Largest column offset k with k * k + 1 <= d * d, since a vertical step covers one row.
// This is floor(sqrt(d * d - 1)) for d >= 1.
export function verticalReach(d) {
  let reach = 0
  while ((reach + 1) * (reach + 1) + 1 <= d * d) reach++
  return reach
}

export function buildTrace({ grid, d }) {
  const rows = grid.length
  const cols = grid[0].length
  const reach = verticalReach(d)
  // Full-grid snapshot used by the visualization only; the solver itself keeps O(cols) arrays per row.
  const table = grid.map(row => [...row].map(ch => (ch === '#' ? '#' : null)))
  const frames = []
  const snap = a => [...a]

  // Every frame carries copies of the arrays it describes, so any step can be shown without replaying earlier steps.
  // `ways` is read at call time and is the arrivals array of the current row.
  let ways = Array(cols).fill(0)
  let side = Array(cols).fill(0)
  let both = Array(cols).fill(0)
  let nxt = Array(cols).fill(0)
  const frame = (marker, phase, activeMarker, message, extra = {}) => {
    frames.push({
      pythonLine: PL(marker),
      phase,
      activeLine: L(activeMarker),
      message,
      row: extra.row ?? -1,
      cell: extra.cell ?? null,
      result: extra.result ?? null,
      d,
      reach,
      window: extra.window ?? null,
      arrivals: snap(ways),
      sideways: snap(side),
      both: snap(both),
      nextArrivals: snap(nxt),
      table: table.map(line => [...line]),
    })
  }

  frame('reach = 0', 'start', 'let reach = 0', `Vertical steps reach ${reach} column${reach === 1 ? '' : 's'} either side (d = ${d}, sideways reach ${d}).`)

  for (let c = 0; c < cols; c++) {
    if (grid[rows - 1][c] !== '.') continue
    ways[c] = 1
    table[rows - 1][c] = 1
    frame('ways[c] = 1', 'start', 'ways[c] = 1', `Bottom cell [${rows - 1},${c}] begins one route.`, { row: rows - 1, cell: { row: rows - 1, col: c } })
  }

  for (let r = rows - 1; r >= 0; r--) {
    const prefix = [0]
    for (let c = 0; c < cols; c++) prefix.push(mod(prefix[c] + ways[c]))
    side = Array(cols).fill(0)
    frame('side = [0] * cols', 'row', 'for (let r = rows - 1', `Row ${r}: sideways sums read arrivals only, so a sideways count is never moved again.`, { row: r })
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '.') continue
      const lo = Math.max(0, c - d)
      const hi = Math.min(cols, c + d + 1)
      const windowSum = mod(prefix[hi] - prefix[lo])
      side[c] = mod(windowSum - ways[c])
      table[r][c] = mod(ways[c] + side[c])
      frame('side[c] = (prefix', 'side', 'side[c] = (prefix', `[${r},${c}] gets ${side[c]} sideways route(s): arrivals in columns ${lo}..${hi - 1} sum to ${windowSum}, minus its own ${ways[c]}.`, {
        row: r,
        cell: { row: r, col: c },
        window: { kind: 'sideways', row: r, col: c, lo, hi, source: 'arrivals', windowSum, self: ways[c], value: side[c] },
      })
    }

    if (r === 0) {
      let total = 0
      for (let c = 0; c < cols; c++) total = mod(total + ways[c] + side[c])
      both = ways.map((w, c) => mod(w + side[c]))
      frame('return sum', 'done', 'if (r === 0)', `Routes ending on the top row total ${total}.`, { row: 0, result: total })
      return { input: { grid, d }, result: total, frames }
    }

    both = ways.map((w, c) => mod(w + side[c]))
    const pre = [0]
    for (let c = 0; c < cols; c++) pre.push(mod(pre[c] + both[c]))
    nxt = Array(cols).fill(0)
    for (let c = 0; c < cols; c++) {
      if (grid[r - 1][c] !== '.') continue
      const lo = Math.max(0, c - reach)
      const hi = Math.min(cols, c + reach + 1)
      const windowSum = mod(pre[hi] - pre[lo])
      nxt[c] = windowSum
      table[r - 1][c] = nxt[c]
      frame('nxt[c] = (pre[', 'down', 'nxt[c] = ', `[${r - 1},${c}] receives ${nxt[c]} route(s) from row ${r}: routes in columns ${lo}..${hi - 1} that can step up (reach ${reach}).`, {
        row: r - 1,
        cell: { row: r - 1, col: c },
        window: { kind: 'step', row: r, col: c, lo, hi, source: 'both', windowSum, value: nxt[c], targetRow: r - 1 },
      })
    }
    ways = nxt
  }
  return { input: { grid, d }, result: 0, frames }
}

export const code = `function countRoutes(grid, d) {
  const MOD = 1000000007
  const rows = grid.length
  const cols = grid[0].length
  let reach = 0
  while ((reach + 1) * (reach + 1) + 1 <= d * d) reach++
  let ways = Array(cols).fill(0)
  for (let c = 0; c < cols; c++) {
    if (grid[rows - 1][c] === '.') ways[c] = 1
  }
  for (let r = rows - 1; r >= 0; r--) {
    const prefix = [0]
    for (let c = 0; c < cols; c++) prefix.push((prefix[c] + ways[c]) % MOD)
    const side = Array(cols).fill(0)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '.') continue
      const lo = Math.max(0, c - d)
      const hi = Math.min(cols, c + d + 1)
      side[c] = (prefix[hi] - prefix[lo] - ways[c] + MOD) % MOD
    }
    if (r === 0) {
      let total = 0
      for (let c = 0; c < cols; c++) total = (total + ways[c] + side[c]) % MOD
      return total
    }
    const both = ways.map((w, c) => (w + side[c]) % MOD)
    const pre = [0]
    for (let c = 0; c < cols; c++) pre.push((pre[c] + both[c]) % MOD)
    const nxt = Array(cols).fill(0)
    for (let c = 0; c < cols; c++) {
      if (grid[r - 1][c] !== '.') continue
      const lo = Math.max(0, c - reach)
      const hi = Math.min(cols, c + reach + 1)
      nxt[c] = (pre[hi] - pre[lo] + MOD) % MOD
    }
    ways = nxt
  }
  return 0
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def count_routes(grid, d):
    MOD = 1000000007
    rows = len(grid)
    cols = len(grid[0])
    reach = 0
    while (reach + 1) * (reach + 1) + 1 <= d * d:
        reach += 1
    ways = [0] * cols
    for c in range(cols):
        if grid[rows - 1][c] == '.':
            ways[c] = 1
    for r in range(rows - 1, -1, -1):
        prefix = [0]
        for c in range(cols):
            prefix.append((prefix[-1] + ways[c]) % MOD)
        side = [0] * cols
        for c in range(cols):
            if grid[r][c] != '.':
                continue
            lo = max(0, c - d)
            hi = min(cols, c + d + 1)
            side[c] = (prefix[hi] - prefix[lo] - ways[c]) % MOD
        if r == 0:
            return sum(ways[c] + side[c] for c in range(cols)) % MOD
        both = [(ways[c] + side[c]) % MOD for c in range(cols)]
        pre = [0]
        for c in range(cols):
            pre.append((pre[-1] + both[c]) % MOD)
        nxt = [0] * cols
        for c in range(cols):
            if grid[r - 1][c] != '.':
                continue
            lo = max(0, c - reach)
            hi = min(cols, c + reach + 1)
            nxt[c] = (pre[hi] - pre[lo]) % MOD
        ways = nxt
    return 0
`
const PY_LINES = python.split('\n')
const PL = s => {
  const index = PY_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
