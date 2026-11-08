// Widest vertical area: sort the x coordinates; the widest gap between neighbours is the answer.
const JS_LINES = [
  { text: 'const xs = points.map(p => p[0]).sort((a, b) => a - b)', py: 'xs = sorted' },
  { text: 'let widest = 0', py: 'widest = 0' },
  { text: 'for (let i = 1; i < xs.length; i++) {', py: 'for i in range' },
  { text: 'widest = Math.max(widest, xs[i] - xs[i - 1])', py: 'widest = max(' },
  { text: '}', py: null },
  { text: 'return widest', py: 'return widest' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def maxWidthOfVerticalArea(points):
    xs = sorted(p[0] for p in points)
    widest = 0
    for i in range(1, len(xs)):
        widest = max(widest, xs[i] - xs[i - 1])
    return widest
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return widest')]))

export const phases = [
  { id: 'sort', label: 'Sort', description: 'Line up the x coordinates from left to right; the y values do not matter.' },
  { id: 'gap', label: 'Gap', description: 'The space between two neighbouring x values holds no points inside it.' },
  { id: 'done', label: 'Result', description: 'The widest gap is the widest vertical area.' },
]

export const examples = [
  { label: 'Four points', input: '{"points":[[2,5],[6,1],[9,3],[4,8]]}' },
  { label: 'Shared x values', input: '{"points":[[3,1],[3,7],[10,2]]}' },
  { label: 'Single x value', input: '{"points":[[5,5],[5,9]]}' },
  { label: 'Two points', input: '{"points":[[0,0],[1,1]]}' },
  { label: 'Shared x values', input: '{"points":[[1,2],[1,5],[3,2],[3,5]]}' },
  { label: 'Large coordinates', input: '{"points":[[1000000000,-1000000000],[-1000000000,1000000000],[0,0]]}' },
  { label: 'Long run: 40 points', input: '{"points":[[15,-7],[-14,15],[36,29],[-21,6],[-32,0],[-16,20],[9,34],[0,-38],[-26,-17],[-42,40],[50,-40],[-41,-17],[15,-2],[32,44],[2,47],[-42,21],[4,14],[-20,-15],[34,46],[12,3],[-40,-6],[12,36],[-18,-43],[-44,3],[-28,-21],[-8,45],[49,3],[6,-24],[11,-45],[-23,-44],[5,-48],[30,10],[20,22],[-39,-26],[24,-27],[24,19],[-30,37],[31,45],[10,47],[15,2]]}' },
]

export const complexity = 'O(n log n) time for n points, dominated by the sort of the x values. Space is O(n).'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.points) || input.points.length < 2 || input.points.length > 40) throw new Error('points is a list of 2 to 40 [x, y] pairs.')
  for (const p of input.points) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && Math.abs(v) <= 1000000000)) throw new Error('Each point is an [x, y] pair of integers.')
  }
  return { points: input.points }
}

export function buildTrace({ points }) {
  const frames = []
  const xs = points.map(p => p[0]).sort((a, b) => a - b)
  const snap = extra => ({ xs: [...xs], ...extra })
  frames.push({ phase: 'sort', activeLine: 1, index: -1, message: `Sorted x values: [${xs.join(', ')}].`, snapshot: snap({}) })
  let widest = 0
  for (let i = 1; i < xs.length; i++) {
    const gap = xs[i] - xs[i - 1]
    widest = Math.max(widest, gap)
    frames.push({ phase: 'gap', activeLine: 4, index: i, gap, message: `Gap from ${xs[i - 1]} to ${xs[i]} is ${gap}; widest so far ${widest}.`, snapshot: snap({ widest }) })
  }
  frames.push({ phase: 'done', activeLine: 6, index: -1, result: widest, message: `Widest vertical area is ${widest}.`, snapshot: snap({ widest, result: widest }) })
  return { input: { points }, xs, result: widest, frames }
}
