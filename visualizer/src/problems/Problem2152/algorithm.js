// LeetCode 2152: Minimum Number of Lines to Cover Points.
// Every useful line passes through a pair of points (or is a single point's own line).
// Each line is a bitmask of the points it covers. The lowest uncovered point must be covered
// by some line through it, so branching on that point with memoisation finds the exact minimum.

const MAX_POINTS = 6
const COORD = 100

export function parseInput(text) {
  let points
  try { points = JSON.parse(text) } catch { throw new Error('Use a JSON array of [x, y] pairs, e.g. [[0,0],[1,1]].') }
  if (!Array.isArray(points) || points.length < 1 || points.length > MAX_POINTS) throw new Error(`Use 1 to ${MAX_POINTS} points. The visualization caps the count at ${MAX_POINTS}.`)
  const seen = new Set()
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && Math.abs(v) <= COORD)) throw new Error(`Each point is [x, y] with integers from -${COORD} to ${COORD}.`)
    if (seen.has(p.join(','))) throw new Error('Points must be distinct.')
    seen.add(p.join(','))
  }
  return { points }
}

export const code = `FUNCTION minLines(points)
    lines ← one line per point alone, plus, for each pair, the mask of points on their line
    RETURN solve(covered = nothing)
FUNCTION solve(covered)
    IF every point is covered THEN RETURN 0
    IF covered is memoised THEN RETURN the memo value
    i ← lowest point not yet covered
    best ← infinity
    FOR each line that contains point i
        best ← min(best, 1 + solve(covered plus line))
    memo[covered] ← best
    RETURN best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_lines(points):
    n = len(points)
    def collinear(i, j, k):
        (x1, y1), (x2, y2), (x3, y3) = points[i], points[j], points[k]
        return (x2 - x1) * (y3 - y1) == (y2 - y1) * (x3 - x1)
    lines = set()
    for i in range(n):
        lines.add(1 << i)
        for j in range(i + 1, n):
            mask = 0
            for k in range(n):
                if collinear(i, j, k):
                    mask |= 1 << k
            lines.add(mask)
    full = (1 << n) - 1
    memo = {}
    def solve(covered):
        if covered == full:
            return 0
        if covered in memo:
            return memo[covered]
        i = next(k for k in range(n) if not covered >> k & 1)
        best = min(1 + solve(covered | line) for line in lines if line >> i & 1)
        memo[covered] = best
        return best
    return solve(0)
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
  { id: 'start', label: 'Candidate lines', description: 'Collect every line that covers points.' },
  { id: 'call', label: 'State', description: 'Work on the covered set and the lowest uncovered point.' },
  { id: 'try', label: 'Try line', description: 'Cover point i with one candidate line.' },
  { id: 'done', label: 'Result', description: 'The fewest lines covering every point.' },
]

const collinear = (points, i, j, k) => {
  const [x1, y1] = points[i]
  const [x2, y2] = points[j]
  const [x3, y3] = points[k]
  return (x2 - x1) * (y3 - y1) === (y2 - y1) * (x3 - x1)
}

export function candidateLines(points) {
  const n = points.length
  const lines = new Map()
  for (let i = 0; i < n; i++) {
    lines.set(1 << i, { mask: 1 << i, a: i, b: i })
    for (let j = i + 1; j < n; j++) {
      let mask = 0
      for (let k = 0; k < n; k++) if (collinear(points, i, j, k)) mask |= 1 << k
      if (!lines.has(mask)) lines.set(mask, { mask, a: i, b: j })
    }
  }
  return [...lines.values()]
}

export function buildTrace({ points }) {
  const n = points.length
  const full = (1 << n) - 1
  const lines = candidateLines(points)
  const frames = []
  const memo = new Map()
  frames.push({ phase: 'start', activeLine: L('lines ← one line per point'), pythonLine: P('lines = set()'), message: `${lines.length} distinct candidate lines cover the points.`, covered: 0, target: -1, line: null, lines, value: null })
  function solve(covered, depth) {
    if (covered === full) return 0
    if (memo.has(covered)) return memo.get(covered)
    const i = [...Array(n).keys()].find(k => !(covered >> k & 1))
    frames.push({ phase: 'call', activeLine: L('i ← lowest point'), pythonLine: P('i = next('), message: `Point ${i} is the lowest uncovered point; try the lines through it.`, covered, target: i, line: null, lines, value: null, depth })
    let best = Infinity
    for (const line of lines) {
      if (!(line.mask >> i & 1)) continue
      const rest = solve(covered | line.mask, depth + 1)
      best = Math.min(best, 1 + rest)
      frames.push({ phase: 'try', activeLine: L('best ← min('), pythonLine: P('best = min('), message: `Line through points ${line.a}${line.b === line.a ? '' : ' and ' + line.b} covers ${bits(line.mask, n).join(', ')}; ${1 + rest} line(s) in total from here.`, covered, target: i, line, lines, value: best, depth })
    }
    memo.set(covered, best)
    frames.push({ phase: 'call', activeLine: L('memo[covered] ← best'), pythonLine: P('memo[covered] = best'), message: `Best from this covered set is ${best}.`, covered, target: i, line: null, lines, value: best, depth })
    return best
  }
  const result = solve(0, 0)
  frames.push({ phase: 'done', activeLine: L('RETURN best'), pythonLine: P('return solve(0)'), message: `${result} line${result === 1 ? '' : 's'} cover every point.`, covered: full, target: -1, line: null, lines, value: result })
  return { input: { points }, result, frames }
}

function bits(mask, n) {
  return [...Array(n).keys()].filter(k => mask >> k & 1)
}
