export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with grid, for example {"grid":[[1,4],[2,3]]}.')
  const { grid } = data
  if (!Array.isArray(grid) || grid.length < 1 || !Array.isArray(grid[0])) throw new Error('grid must be a non-empty array of rows.')
  const m = grid.length
  const n = grid[0].length
  if (m * n < 2 || m * n > 12) throw new Error('The grid must have between 2 and 12 cells.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== n) throw new Error('Every row must have the same length.')
    for (const v of row) if (!Number.isInteger(v) || v < 1 || v > 20) throw new Error('Cells are integers from 1 to 20.')
  }
  return { grid: grid.map(row => [...row]) }
}

const key = (r, c) => `${r},${c}`

// True when the cells (given as "r,c" keys) form one group under up, down, left and right moves.
function connected(cells, keys) {
  if (cells.size <= 1) return true
  const start = cells.values().next().value
  const seen = new Set([start])
  const stack = [start]
  while (stack.length) {
    const [r, c] = stack.pop().split(',').map(Number)
    for (const q of [key(r + 1, c), key(r - 1, c), key(r, c + 1), key(r, c - 1)]) {
      if (cells.has(q) && !seen.has(q)) { seen.add(q); stack.push(q) }
    }
  }
  return seen.size === cells.size && keys
}

export function buildTrace(input) {
  const { grid } = input
  const m = grid.length
  const n = grid[0].length
  const everything = new Set()
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) everything.add(key(r, c))
  const total = grid.flat().reduce((sum, v) => sum + v, 0)
  const sumOf = cells => [...cells].reduce((sum, k) => { const [r, c] = k.split(',').map(Number); return sum + grid[r][c] }, 0)
  const canDiscount = (cells, s, target) => [...cells].some(k => {
    const [r, c] = k.split(',').map(Number)
    const rest = new Set(cells)
    rest.delete(k)
    return s - grid[r][c] === target && connected(rest, true)
  })
  const cutOk = (a, sa, sb) => sa === sb || canDiscount(a, sa, sb) || canDiscount(new Set([...everything].filter(k => !a.has(k))), sb, sa)
  const frames = [{ phase: 'start', activeLine: L('let total be the sum'), cut: null, verdict: null, message: `Total sum is ${total}. Try each straight cut, then each discount.` }]
  const check = (label, a, phaseLine) => {
    const sa = sumOf(a)
    const sb = total - sa
    const ok = cutOk(a, sa, sb)
    frames.push({ phase: 'cut', activeLine: phaseLine, cut: label, verdict: ok, message: `${label}: sections sum to ${sa} and ${sb}. ${ok ? 'A valid discount or equal sums exists.' : 'No valid discount balances this cut.'}` })
    return ok
  }
  for (let r = 0; r < m - 1; r++) {
    const top = new Set()
    for (let i = 0; i <= r; i++) for (let j = 0; j < n; j++) top.add(key(i, j))
    if (check(`Horizontal cut after row ${r}`, top, L('for each horizontal cut'))) {
      frames.push({ phase: 'done', activeLine: L('return true'), cut: null, verdict: true, message: 'Found a cut that works, so the answer is true.' })
      return { input, result: true, frames }
    }
  }
  for (let c = 0; c < n - 1; c++) {
    const left = new Set()
    for (let i = 0; i < m; i++) for (let j = 0; j <= c; j++) left.add(key(i, j))
    if (check(`Vertical cut after column ${c}`, left, L('for each vertical cut'))) {
      frames.push({ phase: 'done', activeLine: L('return true'), cut: null, verdict: true, message: 'Found a cut that works, so the answer is true.' })
      return { input, result: true, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return false'), cut: null, verdict: false, message: 'No straight cut works, so the answer is false.' })
  return { input, result: false, frames }
}

export const code = `equal sum grid partition (grid)
  let total be the sum of all cells
  for each horizontal cut after row r
    let top be the cells above the cut and bottom the cells below it
    if the two sums are equal then return true
    if removing one top cell makes the top sum equal the bottom sum, and the rest of top stays connected, then return true
    if removing one bottom cell makes the bottom sum equal the top sum, and the rest of bottom stays connected, then return true
  for each vertical cut after column c
    check the same three conditions with the left and right sections
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def equal_sum_partition(grid):
    m, n = len(grid), len(grid[0])
    everything = frozenset((r, c) for r in range(m) for c in range(n))
    total = sum(sum(row) for row in grid)

    def connected(cells):
        if len(cells) <= 1:
            return True
        start = next(iter(cells))
        seen = {start}
        stack = [start]
        while stack:
            r, c = stack.pop()
            for q in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if q in cells and q not in seen:
                    seen.add(q)
                    stack.append(q)
        return len(seen) == len(cells)

    def can_discount(cells, s, target):
        return any(s - grid[r][c] == target and connected(cells - {(r, c)}) for r, c in cells)

    def cut_ok(a, b):
        sa = sum(grid[r][c] for r, c in a)
        sb = total - sa
        if sa == sb:
            return True
        return can_discount(a, sa, sb) or can_discount(b, sb, sa)

    for r in range(m - 1):
        top = frozenset((i, j) for i in range(r + 1) for j in range(n))
        if cut_ok(top, everything - top):
            return True
    for c in range(n - 1):
        left = frozenset((i, j) for i in range(m) for j in range(c + 1))
        if cut_ok(left, everything - left):
            return True
    return False
`
