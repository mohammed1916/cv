export const phases = [
  { id: 'start', label: 'Sort positions', description: 'Sort the ball positions. The answer lies between 1 and the full span from the first to the last position.' },
  { id: 'probe', label: 'Try a gap', description: 'Pick the middle of the remaining range as a candidate minimum distance.' },
  { id: 'place', label: 'Greedy placement', description: 'Walk left to right, placing a ball whenever it is at least the candidate gap from the last ball placed.' },
  { id: 'record', label: 'Narrow range', description: 'If m balls fit, a larger gap might work, so raise the lower bound. Otherwise lower the upper bound.' },
  { id: 'done', label: 'Complete', description: 'The lower bound is the largest gap that still fits all m balls.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"positions": [1, 4, 9], "m": 2}.')
  const { positions, m } = input
  if (!Array.isArray(positions) || positions.length < 2 || positions.length > 12 || !positions.every(v => Number.isInteger(v) && v >= 1 && v <= 30)) throw new Error('positions is a list of 2 to 12 distinct integers from 1 to 30.')
  if (new Set(positions).size !== positions.length) throw new Error('positions must be distinct.')
  if (!Number.isInteger(m) || m < 2 || m > positions.length) throw new Error('m is an integer from 2 up to the number of positions.')
  return { positions, m }
}

export const code = [
  "function maxMinDistance(positions, m) {",
  "  positions.sort((a, b) => a - b)",
  "  let lo = 1, hi = positions[positions.length - 1] - positions[0]",
  "  while (lo < hi) {",
  "    const mid = Math.floor((lo + hi + 1) / 2)",
  "    const placed = [positions[0]]; let last = positions[0]",
  "    for (let i = 1; i < positions.length; i++) {",
  "      if (positions[i] - last >= mid) { placed.push(positions[i]); last = positions[i] } }",
  "    if (placed.length >= m) lo = mid; else hi = mid - 1 }",
  "  return lo }",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def max_min_distance(positions, m):
    positions.sort()
    lo, hi = 1, positions[-1] - positions[0]
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if can_place(positions, m, mid):
            lo = mid
        else:
            hi = mid - 1
    return lo

def can_place(positions, m, gap):
    count, last = 1, positions[0]
    for p in positions[1:]:
        if p - last >= gap:
            count += 1
            last = p
    return count >= m
`
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ positions: given, m }) {
  const positions = [...given].sort((a, b) => a - b)
  const frames = []
  let lo = 1, hi = positions[positions.length - 1] - positions[0]
  const snap = extra => ({ positions, m, lo, hi, ...extra })
  frames.push({ phase: 'start', activeLine: L('positions.sort((a, b) => a - b)'), pythonLine: P('positions.sort()'), snapshot: snap({ mid: null, placed: [] }),
    message: `Sorted positions: ${positions.join(', ')}. Place ${m} balls. The gap answer lies from ${lo} to ${hi}.` })
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2)
    frames.push({ phase: 'probe', activeLine: L('mid = '), pythonLine: P('mid = '), snapshot: snap({ mid, placed: [] }),
      message: `Candidate gap ${mid}, halfway between the bounds. Can ${m} balls all be at least ${mid} apart?` })
    const placed = [positions[0]]
    let last = positions[0]
    for (let i = 1; i < positions.length; i++) {
      if (positions[i] - last >= mid) { placed.push(positions[i]); last = positions[i] }
    }
    const ok = placed.length >= m
    frames.push({ phase: 'place', activeLine: L('for (let i = 1; i < positions.length'), pythonLine: P('for p in positions'), snapshot: snap({ mid, placed: [...placed], ok }),
      message: `Greedy placement with gap ${mid} fits ${placed.length} ball${placed.length === 1 ? '' : 's'} at ${placed.join(', ')}. ${ok ? `That reaches ${m}, so ${mid} is achievable.` : `That is fewer than ${m}, so ${mid} is too large.`}` })
    if (ok) lo = mid
    else hi = mid - 1
    frames.push({ phase: 'record', activeLine: L('if (placed.length >= m)'), pythonLine: P('if can_place'), snapshot: snap({ mid, placed: [], ok }),
      message: `${ok ? `Raise the lower bound to ${lo}.` : `Lower the upper bound to ${hi}.`} The range is now ${lo} to ${hi}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return lo'), pythonLine: P('return lo'), snapshot: snap({ mid: null, placed: [] }),
    message: `The range has closed at ${lo}. That is the largest minimum distance for ${m} balls.` })
  return { input: { positions: given, m }, result: lo, frames }
}
