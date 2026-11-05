// Comparing squared distances gives the same order as comparing true distances, so no square roots are needed.
// Sort the points by that distance and keep the first k.
export const code = String.raw`function kClosest(points, k) {
  const squared = ([x, y]) => x * x + y * y; // squared distance orders points the same way
  const ranked = points.map(point => ({ point, d: squared(point) }));
  ranked.sort((p, q) => p.d - q.d);
  return ranked.slice(0, k).map(item => item.point);
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def k_closest(points, k):
    ranked = [(x * x + y * y, [x, y]) for x, y in points]  # squared distance orders points the same way
    ranked.sort(key=lambda item: item[0])
    return [point for _, point in ranked[:k]]`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'measure', label: 'Measure', description: 'Work out the squared distance of each point from the origin.' },
  { id: 'sort', label: 'Sort', description: 'Order the points from nearest to farthest.' },
  { id: 'take', label: 'Take k', description: 'The first k points in the order are the answer.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const points = input && input.points
  const k = input && input.k
  if (!Array.isArray(points) || points.length < 1 || points.length > 12) throw new Error('Use points: a list of 1 to 12 [x, y] pairs.')
  for (const point of points) {
    if (!Array.isArray(point) || point.length !== 2 || point.some(v => !Number.isInteger(v) || Math.abs(v) > 100)) {
      throw new Error('Each point must be a pair of integers from -100 to 100.')
    }
  }
  if (!Number.isInteger(k) || k < 1 || k > points.length) throw new Error('k must be an integer from 1 to the number of points.')
  return { points, k }
}

export function buildTrace({ points, k }) {
  const frames = []
  const ranked = points.map((point, index) => ({ point, d: point[0] * point[0] + point[1] * point[1], index }))
  ranked.forEach((item, index) => {
    frames.push({ phase: 'measure', activeLine: L('const ranked = points.map'), pythonLine: PY('ranked = [(x * x'), current: index, order: null, chosen: [], k,
      message: `Point [${item.point}] has squared distance ${item.d}.` })
  })
  const sorted = [...ranked].sort((p, q) => p.d - q.d)
  frames.push({ phase: 'sort', activeLine: L('ranked.sort'), pythonLine: PY('ranked.sort'), current: null, order: sorted.map(item => item.index), chosen: [], k,
    message: `Sorted by distance: ${sorted.map(item => `[${item.point}] (${item.d})`).join(', ')}.` })
  const chosen = []
  for (let i = 0; i < k; i++) {
    chosen.push(sorted[i].index)
    frames.push({ phase: 'take', activeLine: L('return ranked.slice'), pythonLine: PY('return [point'), current: sorted[i].index, order: sorted.map(item => item.index), chosen: [...chosen], k,
      message: `Take [${sorted[i].point}] as number ${i + 1} of ${k}.` })
  }
  const result = sorted.slice(0, k).map(item => item.point)
  return { input: { points, k }, result, frames, radius: sorted[k - 1].d }
}
