// Each cell is split into four triangles (top, right, bottom, left). A slash or a backslash joins two pairs of
// triangles inside the cell, open space joins all four, and shared cell edges join neighbouring triangles.
// Regions are the groups that remain connected.
export const code = String.raw`function countRegions(grid) {
  const n = grid.length;
  const parent = Array.from({ length: 4 * n * n }, (_, i) => i); // 0 top, 1 right, 2 bottom, 3 left
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const join = (a, b) => { parent[find(a)] = find(b); };
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const t = 4 * (r * n + c);
      const top = t, right = t + 1, bottom = t + 2, left = t + 3;
      const ch = grid[r][c];
      if (ch === '/') { join(top, left); join(right, bottom); }
      else if (ch === '\\') { join(top, right); join(left, bottom); }
      else { join(top, right); join(right, bottom); join(bottom, left); }
    }
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const t = 4 * (r * n + c);
      if (c + 1 < n) join(t + 1, t + 7); // right edge meets the left edge of the next cell
      if (r + 1 < n) join(t + 2, t + 4 * n); // bottom edge meets the top edge of the cell below
    }
  }
  const roots = new Set();
  for (let i = 0; i < parent.length; i++) roots.add(find(i));
  return roots.size;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def count_regions(grid):
    n = len(grid)
    parent = list(range(4 * n * n))  # 0 top, 1 right, 2 bottom, 3 left
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def join(a, b):
        parent[find(a)] = find(b)
    for r in range(n):
        for c in range(n):
            t = 4 * (r * n + c)
            top, right, bottom, left = t, t + 1, t + 2, t + 3
            ch = grid[r][c]
            if ch == "/":
                join(top, left)
                join(right, bottom)
            elif ch == "\\":
                join(top, right)
                join(left, bottom)
            else:
                join(top, right)
                join(right, bottom)
                join(bottom, left)
    for r in range(n):
        for c in range(n):
            t = 4 * (r * n + c)
            if c + 1 < n:
                join(t + 1, t + 7)
            if r + 1 < n:
                join(t + 2, t + 4 * n)
    return len({find(i) for i in range(len(parent))})`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'split', label: 'Split cells', description: 'Every cell starts as four separate triangles.' },
  { id: 'cells', label: 'Inside cells', description: 'Slashes and open space join triangles inside each cell.' },
  { id: 'edges', label: 'Cell edges', description: 'Neighbouring cells join the triangles that touch across their shared edge.' },
  { id: 'done', label: 'Count', description: 'Each remaining group of triangles is one region.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const grid = input && input.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 5) {
    throw new Error('Use a grid: a list of 1 to 5 strings.')
  }
  for (const row of grid) {
    if (typeof row !== 'string' || row.length !== grid.length || /[^/\\ ]/.test(row)) {
      throw new Error('Each row must be as long as the grid and use only /, backslash or space.')
    }
  }
  return { grid }
}

export function buildTrace({ grid }) {
  const n = grid.length
  const parent = Array.from({ length: 4 * n * n }, (_, i) => i)
  const frames = []
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const join = (a, b) => { parent[find(a)] = find(b) }
  const groups = () => new Set(parent.map((_, i) => find(i))).size
  const snap = (phase, js, py, message, extra = {}) => frames.push({
    phase, activeLine: L(js), pythonLine: PY(py), message, groups: groups(),
    parent: [...parent], cell: null, edge: null, ...extra,
  })
  snap('split', 'const parent = Array.from', 'parent = list(range', 'Every triangle starts in its own group.')
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const t = 4 * (r * n + c)
      const ch = grid[r][c]
      if (ch === '/') { join(t, t + 3); join(t + 1, t + 2) }
      else if (ch === '\\') { join(t, t + 1); join(t + 3, t + 2) }
      else { join(t, t + 1); join(t + 1, t + 2); join(t + 2, t + 3) }
      const message = ch === '/' ? `Cell (${r},${c}) holds a slash: top joins left, right joins bottom.`
        : ch === '\\' ? `Cell (${r},${c}) holds a backslash: top joins right, left joins bottom.`
          : `Cell (${r},${c}) is open: all four triangles join.`
      snap('cells', ch === '/' ? 'if (ch === \'/\')' : ch === '\\' ? "else if (ch === '\\\\')" : 'else { join(top, right)', ch === '/' ? 'if ch == "/"' : ch === '\\' ? 'elif ch ==' : 'else:', message, { cell: [r, c] })
    }
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const t = 4 * (r * n + c)
      if (c + 1 < n) {
        join(t + 1, t + 7)
        snap('edges', 'if (c + 1 < n)', 'if c + 1 < n:', `Right triangle of (${r},${c}) joins left triangle of (${r},${c + 1}).`, { cell: [r, c], edge: 'right' })
      }
      if (r + 1 < n) {
        join(t + 2, t + 4 * n)
        snap('edges', 'if (r + 1 < n)', 'if r + 1 < n:', `Bottom triangle of (${r},${c}) joins top triangle of (${r + 1},${c}).`, { cell: [r, c], edge: 'down' })
      }
    }
  }
  const count = groups()
  frames.push({ phase: 'done', activeLine: L('return roots.size'), pythonLine: PY('return len'), message: `${count} groups remain, so there are ${count} regions.`, groups: count, parent: [...parent], cell: null, edge: null })
  return { input: { grid }, result: count, frames }
}
