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
function verticalReach(d) {
  let reach = 0
  while ((reach + 1) * (reach + 1) + 1 <= d * d) reach++
  return reach
}

export function buildTrace({ grid, d }) {
  const rows = grid.length
  const cols = grid[0].length
  const reach = verticalReach(d)
  const table = grid.map(row => [...row].map(ch => (ch === '#' ? '#' : null)))
  const frames = []
  const frame = (marker, phase, activeMarker, message, row = -1, cell = null, result = null) => {
    frames.push({ pythonLine: PL(marker), phase, activeLine: L(activeMarker), message, row, cell, result, table: table.map(line => [...line]) })
  }

  frame('reach = 0', 'start', 'set the vertical reach', `Vertical steps reach ${reach} column${reach === 1 ? '' : 's'} either side (d = ${d}).`)

  let ways = Array(cols).fill(0)
  for (let c = 0; c < cols; c++) {
    if (grid[rows - 1][c] !== '.') continue
    ways[c] = 1
    table[rows - 1][c] = 1
    frame('ways[c] = 1', 'start', 'each available bottom cell starts', `Bottom cell [${rows - 1},${c}] begins one route.`, rows - 1, { row: rows - 1, col: c })
  }

  for (let r = rows - 1; r >= 0; r--) {
    const prefix = [0]
    for (let c = 0; c < cols; c++) prefix.push(mod(prefix[c] + ways[c]))
    const side = Array(cols).fill(0)
    frame('side = [0] * cols', 'row', 'for each row from the bottom', `Row ${r}: sideways moves use the routes that arrived by a step or a start.`, r)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '.') continue
      const lo = Math.max(0, c - d)
      const hi = Math.min(cols, c + d + 1)
      side[c] = mod(prefix[hi] - prefix[lo] - ways[c])
      table[r][c] = mod(ways[c] + side[c])
      frame('side[c] = (prefix', 'side', 'sideways count of each', `[${r},${c}] holds ${table[r][c]} route(s) after sideways moves within distance ${d}.`, r, { row: r, col: c })
    }

    if (r === 0) {
      let total = 0
      for (let c = 0; c < cols; c++) total = mod(total + ways[c] + side[c])
      frame('return sum', 'done', 'if this is the top row', `Routes ending on the top row total ${total}.`, 0, null, total)
      return { input: { grid, d }, result: total, frames }
    }

    const both = ways.map((w, c) => mod(w + side[c]))
    const pre = [0]
    for (let c = 0; c < cols; c++) pre.push(mod(pre[c] + both[c]))
    const nxt = Array(cols).fill(0)
    for (let c = 0; c < cols; c++) {
      if (grid[r - 1][c] !== '.') continue
      const lo = Math.max(0, c - reach)
      const hi = Math.min(cols, c + reach + 1)
      nxt[c] = mod(pre[hi] - pre[lo])
      table[r - 1][c] = nxt[c]
      frame('nxt[c] = (pre[', 'down', 'vertical step gives', `[${r - 1},${c}] receives ${nxt[c]} route(s) stepping up from row ${r}.`, r - 1, { row: r - 1, col: c })
    }
    ways = nxt
  }
  return { input: { grid, d }, result: 0, frames }
}

export const code = `count routes from the bottom row up to the top row
  set the vertical reach so a one-row step stays within distance d
  each available bottom cell starts with one route
  for each row from the bottom row up to the top row
    the sideways count of each available cell sums routes in this row within distance d, not counting the cell itself
    if this is the top row then return the sum of routes on it
    the routes that can step up are the routes in this row, sideways or not
    the vertical step gives each available cell above the sum of those routes within the reach columns
  return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
const PL = s => PY_LINES.findIndex(line => line.includes(s)) + 1
