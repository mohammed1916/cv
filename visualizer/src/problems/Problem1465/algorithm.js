export const phases = [
  { id: 'start', label: 'Start', description: 'Read the cake size and the cut positions on each axis.' },
  { id: 'sort', label: 'Sort points', description: 'Add both edges to each cut list and sort the positions.' },
  { id: 'gap', label: 'Measure gaps', description: 'Each gap between neighbouring points is one piece width. Keep the largest.' },
  { id: 'combine', label: 'Multiply', description: 'The largest piece uses the largest horizontal gap and the largest vertical gap.' },
  { id: 'done', label: 'Complete', description: 'Return the product modulo 1000000007.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with h, w, horizontalCuts and verticalCuts.')
  const { h, w, horizontalCuts, verticalCuts } = input
  if (!Number.isInteger(h) || !Number.isInteger(w) || h < 2 || w < 2 || h > 1000000000 || w > 1000000000) {
    throw new Error('h and w are integers from 2 to 1000000000.')
  }
  const check = (cuts, length, name) => {
    if (!Array.isArray(cuts) || cuts.length > 1000) throw new Error(`${name} is a list of at most 1000 cuts.`)
    const seen = new Set()
    for (const cut of cuts) {
      if (!Number.isInteger(cut) || cut < 1 || cut > length - 1 || seen.has(cut)) {
        throw new Error(`${name} needs distinct integers from 1 to ${length - 1}.`)
      }
      seen.add(cut)
    }
  }
  check(horizontalCuts, h, 'horizontalCuts')
  check(verticalCuts, w, 'verticalCuts')
  return { h, w, horizontalCuts, verticalCuts }
}

const at = (activeLine, pythonLine = activeLine) => ({ activeLine, pythonLine })
const MOD = 1000000007n

export function buildTrace({ h, w, horizontalCuts, verticalCuts }) {
  const best = { horizontal: 0, vertical: 0 }
  const snap = (axis, points, gaps, index) => ({ axis, points, gaps, index, best: { ...best } })
  const frames = [{ phase: 'start', ...at(1), snapshot: snap(null, [], [], null), message: `The cake is ${h} by ${w}. Each axis is measured on its own.` }]

  const measure = (axis, length, cuts) => {
    const points = [...cuts, 0, length].sort((a, b) => a - b)
    frames.push({ phase: 'sort', ...at(3), snapshot: snap(axis, points, [], null), message: `${axis} points with both edges: ${points.join(', ')}.` })
    const gaps = []
    let top = 0
    for (let i = 0; i + 1 < points.length; i++) {
      const gap = points[i + 1] - points[i]
      gaps.push(gap)
      top = Math.max(top, gap)
      frames.push({ phase: 'gap', ...at(6), snapshot: snap(axis, points, [...gaps], i), message: `${points[i]} to ${points[i + 1]} is ${gap} wide. Largest so far: ${top}.` })
    }
    best[axis] = top
    frames.push({ phase: 'gap', ...at(7), snapshot: snap(axis, points, gaps, null), message: `Largest ${axis} gap is ${top}.` })
  }

  measure('horizontal', h, horizontalCuts)
  measure('vertical', w, verticalCuts)
  const product = BigInt(best.horizontal) * BigInt(best.vertical)
  const result = Number(product % MOD)
  frames.push({ phase: 'combine', ...at(8), snapshot: snap(null, [], [], null), message: `${best.horizontal} * ${best.vertical} = ${product}, which is ${result} modulo 1000000007.` })
  frames.push({ phase: 'done', ...at(8), snapshot: snap(null, [], [], null), message: `Return ${result}.` })
  return { input: { h, w, horizontalCuts, verticalCuts }, result, frames }
}

export const code = [
  'max area (h, w, horizontal, vertical):',
  '  largest_gap(length, cuts):',
  '    points = sort(cuts plus 0 and length)',
  '    best = 0',
  '    for each neighbouring pair (a, b) in points:',
  '      best = max(best, b - a)',
  '    return best',
  '  return largest_gap(h, horizontal) * largest_gap(w, vertical) mod 1000000007',
].map((text, index) => ({ line: index + 1, text }))

export const python = [
  'def max_area(h, w, horizontal_cuts, vertical_cuts):',
  '    def largest_gap(length, cuts):',
  '        points = sorted(cuts + [0, length])',
  '        best = 0',
  '        for a, b in zip(points, points[1:]):',
  '            best = max(best, b - a)',
  '        return best',
  '    return largest_gap(h, horizontal_cuts) * largest_gap(w, vertical_cuts) % (10**9 + 7)',
].join('\n')
