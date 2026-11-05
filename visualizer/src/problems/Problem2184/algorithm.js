// LeetCode 2184: Number of Ways to Build Sturdy Brick Wall.
// A row is a sequence of bricks whose widths sum to width. Its seams are the running sums strictly between 0 and width.
// Two adjacent rows are compatible when they share no seam. Count layouts row by row: dp[j] is the number of walls
// that end in layout j, and the next row adds up dp over every compatible previous layout.

const MOD = 1000000007
const MAX_WIDTH = 10
const MAX_HEIGHT = 3

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"height":2,"width":4,"bricks":[1,2]}.') }
  if (!spec || !Number.isInteger(spec.height) || !Number.isInteger(spec.width) || !Array.isArray(spec.bricks)) throw new Error('Give integer height and width and a bricks array.')
  if (spec.height < 1 || spec.height > MAX_HEIGHT) throw new Error(`height is from 1 to ${MAX_HEIGHT} in this visualization.`)
  if (spec.width < 1 || spec.width > MAX_WIDTH) throw new Error(`width is from 1 to ${MAX_WIDTH} in this visualization.`)
  if (spec.bricks.length < 1 || spec.bricks.length > 4) throw new Error('Use 1 to 4 brick widths.')
  if (!spec.bricks.every(v => Number.isInteger(v) && v >= 1 && v <= spec.width)) throw new Error(`Each brick width is an integer from 1 to ${spec.width}.`)
  if (new Set(spec.bricks).size !== spec.bricks.length) throw new Error('Brick widths must be unique.')
  return { height: spec.height, width: spec.width, bricks: spec.bricks }
}

export const code = `FUNCTION buildWall(height, width, bricks)
    layouts ← every sequence of bricks whose widths sum to width
    seams[j] ← running sums of layout j, strictly between 0 and width
    dp[j] ← 1 for every layout j (first row)
    REPEAT height - 1 times
        next[j] ← sum of dp[i] over layouts i where seams[i] and seams[j] share no value
    dp ← next
    RETURN sum of dp modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def build_wall(height, width, bricks):
    MOD = 10**9 + 7
    layouts = []
    def dfs(total, path):
        if total == width:
            layouts.append(path[:])
            return
        for b in bricks:
            if total + b <= width:
                path.append(b)
                dfs(total + b, path)
                path.pop()
    dfs(0, [])
    seams = []
    for row in layouts:
        s, acc = set(), 0
        for b in row[:-1]:
            acc += b
            s.add(acc)
        seams.append(s)
    dp = [1] * len(layouts)
    for _ in range(height - 1):
        dp = [sum(dp[i] for i in range(len(layouts)) if not (seams[i] & seams[j])) % MOD
              for j in range(len(layouts))]
    return sum(dp) % MOD
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'layouts', label: 'Row layouts', description: 'List every row that fills the width exactly, with its seams.' },
  { id: 'rows', label: 'Stack rows', description: 'Extend the walls row by row; adjacent rows may not share a seam.' },
  { id: 'done', label: 'Result', description: 'The number of sturdy walls.' },
]

export function buildTrace({ height, width, bricks }) {
  const layouts = []
  const frames = []
  const push = (phase, row, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, row, index: row, activeLine, pythonLine, message, height, width, layouts: layouts.map(l => l.bricks), ...extra })
  const dfs = (total, path) => {
    if (total === width) {
      const seams = []
      let acc = 0
      for (const b of path.slice(0, -1)) { acc += b; seams.push(acc) }
      layouts.push({ bricks: path.slice(), seams })
      return
    }
    for (const b of bricks) if (total + b <= width) { path.push(b); dfs(total + b, path); path.pop() }
  }
  dfs(0, [])
  push('layouts', -1, L('layouts ← every'), P('dfs(0, [])'), `${layouts.length} row layouts fill the width ${width} exactly.`, { layouts: layouts.map(l => l.bricks) })
  const share = (a, b) => a.seams.some(s => b.seams.includes(s))
  let dp = layouts.map(() => 1)
  push('rows', 0, L('dp[j] ← 1'), P('dp = [1]'), `Row 1: every layout is allowed, so each has 1 way.`, { dp: dp.slice(), layouts: layouts.map(l => l.bricks), seams: layouts.map(l => l.seams) })
  for (let row = 1; row < height; row++) {
    const next = layouts.map((lj, j) => {
      let sum = 0
      layouts.forEach((li, i) => { if (!share(li, lj)) sum += dp[i] })
      return sum % 1000000007
    })
    dp = next
    push('rows', row, L('REPEAT height'), P('for _ in range(height - 1)'), `Row ${row + 1}: each layout sums the ways of the compatible layouts below it.`, { dp: dp.slice(), layouts: layouts.map(l => l.bricks), seams: layouts.map(l => l.seams) })
  }
  const result = dp.reduce((a, b) => (a + b) % 1000000007, 0)
  push('done', -1, L('RETURN sum of dp'), P('return sum(dp)'), `${result} sturdy walls of height ${height}.`, { dp: dp.slice(), layouts: layouts.map(l => l.bricks), seams: layouts.map(l => l.seams) })
  return { input: { height, width, bricks }, result, frames }
}
