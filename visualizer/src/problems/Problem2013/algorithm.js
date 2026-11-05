export const phases = [
  { id: 'start', label: 'Empty store', description: 'No points are stored, so no square can be counted.' },
  { id: 'add', label: 'Add point', description: 'Store a point; duplicates are kept as separate counts.' },
  { id: 'count', label: 'Count squares', description: 'For each stored point on a diagonal of the query, the other two corners must exist with their counts.' },
  { id: 'done', label: 'Result', description: 'Return the number of squares for each query.' },
]

export const code = `class DetectSquares {
  constructor() {
    this.counts = new Map()
  }

  add([x, y]) {
    const key = \`\${x},\${y}\`
    this.counts.set(key, (this.counts.get(key) ?? 0) + 1)
  }

  count([qx, qy]) {
    let total = 0
    for (const [key, c] of this.counts) {
      const [px, py] = key.split(',').map(Number)
      if (px === qx || Math.abs(px - qx) !== Math.abs(py - qy)) continue
      total += c * (this.counts.get(\`\${px},\${qy}\`) ?? 0) * (this.counts.get(\`\${qx},\${py}\`) ?? 0)
    }
    return total
  }
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `class DetectSquares:
    def __init__(self):
        self.counts = {}

    def add(self, point):
        key = tuple(point)
        self.counts[key] = self.counts.get(key, 0) + 1

    def count(self, point):
        qx, qy = point
        total = 0
        for (px, py), c in self.counts.items():
            if px == qx or abs(px - qx) != abs(py - qy):
                continue
            total += c * self.counts.get((px, qy), 0) * self.counts.get((qx, py), 0)
        return total
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let ops
  try { ops = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [["add",[3,10]],["count",[11,2]]].') }
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 40) throw new Error('Give 1 to 40 operations.')
  for (const op of ops) {
    if (!Array.isArray(op) || (op[0] !== 'add' && op[0] !== 'count') || !Array.isArray(op[1]) || op[1].length !== 2) {
      throw new Error('Each operation is ["add", [x, y]] or ["count", [x, y]].')
    }
    if (!op[1].every(v => Number.isInteger(v) && v >= 0 && v <= 20)) throw new Error('Coordinates must be whole numbers from 0 to 20.')
  }
  return ops
}

export function buildTrace(ops) {
  const frames = []
  const counts = new Map()
  const results = []
  const add = (phase, c, p, message, extra) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { ops, counts: [...counts.entries()], extra, results: results.slice() },
  })
  add('start', 'this.counts = new Map', 'self.counts = {}', 'Empty store.', null)
  ops.forEach(([kind, [x, y]]) => {
    if (kind === 'add') {
      const key = `${x},${y}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
      add('add', 'this.counts.set(key', 'self.counts[key]', `Stored (${x}, ${y}); it now appears ${counts.get(key)} time(s).`, { query: null, found: 0 })
    } else {
      let total = 0
      for (const [key, c] of counts) {
        const [px, py] = key.split(',').map(Number)
        if (px === x || Math.abs(px - x) !== Math.abs(py - y)) continue
        total += c * (counts.get(`${px},${y}`) ?? 0) * (counts.get(`${x},${py}`) ?? 0)
      }
      results.push(total)
      add('count', 'for (const [key, c]', 'for (px, py), c', `Query (${x}, ${y}) forms ${total} square(s).`, { query: [x, y], found: total })
    }
  })
  add('done', 'return total', 'return total', `Query results: ${results.join(', ') || 'none'}.`, null)
  return { input: ops, result: results, frames }
}
