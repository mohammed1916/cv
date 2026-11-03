export const phases = [
  { id: 'collect', label: 'Read x-coordinates', description: 'Only horizontal positions matter. Heights do not change the strip widths.' },
  { id: 'sort', label: 'Sort by x', description: 'Put the x-coordinates in left-to-right order.' },
  { id: 'gap', label: 'Compare neighbours', description: 'The strip between two neighbouring x-values holds no point inside it.' },
  { id: 'done', label: 'Widest strip', description: 'The answer is the largest neighbouring gap.' },
]

export function parseInput(text) {
  const points = JSON.parse(text)
  if (!Array.isArray(points) || points.length < 2 || points.length > 12) throw new Error('Enter a JSON array of 2–12 [x, y] points.')
  return points.map((point, i) => {
    if (!Array.isArray(point) || point.length !== 2 || !point.every(v => Number.isInteger(v) && Math.abs(v) <= 1e9)) {
      throw new Error(`Point ${i + 1} must be [x, y] with integers between −1e9 and 1e9.`)
    }
    return { x: point[0], y: point[1] }
  })
}

export function buildTrace(points) {
  const xs = points.map(p => p.x)
  const frames = []
  frames.push({
    phase: 'collect', activeLine: 1,
    message: `Read ${xs.length} x-coordinates: ${xs.join(', ')}. The y-values are ignored.`,
    snapshot: { xs: [...xs], sorted: [], gaps: [], best: 0, current: null },
  })
  const sorted = [...xs].sort((a, b) => a - b)
  frames.push({
    phase: 'sort', activeLine: 2,
    message: `Sorted left to right: ${sorted.join(', ')}.`,
    snapshot: { xs: [...xs], sorted: [...sorted], gaps: [], best: 0, current: null },
  })
  const gaps = []
  let best = 0
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1]
    gaps.push(gap)
    best = Math.max(best, gap)
    frames.push({
      phase: 'gap', activeLine: 5,
      message: `From ${sorted[i - 1]} to ${sorted[i]} is a strip of width ${gap}. ${gap === best ? 'It is the widest strip so far.' : `The widest so far is still ${best}.`}`,
      snapshot: { xs: [...xs], sorted: [...sorted], gaps: [...gaps], best, current: i - 1 },
    })
  }
  frames.push({
    phase: 'done', activeLine: 6,
    message: `Return ${best}: the widest vertical strip with no point strictly inside it.`,
    snapshot: { xs: [...xs], sorted: [...sorted], gaps: [...gaps], best, current: null },
  })
  return { input: points, result: best, frames }
}

const LINES = [
  'def widest_strip(points):',
  '    xs = sorted(p[0] for p in points)',
  '    best = 0',
  '    for i in range(1, len(xs)):',
  '        best = max(best, xs[i] - xs[i - 1])',
  '    return best',
]
export const code = LINES.map((text, index) => ({ line: index + 1, text }))
export const python = LINES.join('\n')
export const pythonLineMap = Object.fromEntries(LINES.map((_, i) => [i + 1, i + 1]))
