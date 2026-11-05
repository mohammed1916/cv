const CODE_LINES = `function removeInterval(intervals, toBeRemoved) {
  const [a, b] = toBeRemoved
  const result = []
  for (const [s, e] of intervals) {
    if (e <= a || s >= b) {
      result.push([s, e])
      continue
    }
    if (s < a) result.push([s, a])
    if (b < e) result.push([b, e])
  }
  return result
}`.split('\n')

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `def remove_interval(intervals, to_remove):
    a, b = to_remove
    result = []
    for s, e in intervals:
        if e <= a or s >= b:
            result.append([s, e])
            continue
        if s < a:
            result.append([s, a])
        if b < e:
            result.append([b, e])
    return result
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Cut', description: 'Read the interval to remove.' },
  { id: 'scan', label: 'Scan', description: 'Compare the next interval with the cut.' },
  { id: 'keep', label: 'Untouched', description: 'The interval misses the cut.' },
  { id: 'left', label: 'Left piece', description: 'Keep the part before the cut.' },
  { id: 'right', label: 'Right piece', description: 'Keep the part after the cut.' },
  { id: 'gone', label: 'Fully cut', description: 'Nothing of the interval survives.' },
  { id: 'done', label: 'Result', description: 'Every surviving piece is listed in order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with intervals and toBeRemoved.')
  const { intervals, toBeRemoved } = input
  const valid = pair => Array.isArray(pair) && pair.length === 2 && pair.every(Number.isInteger) && pair[0] >= 0 && pair[0] < pair[1] && pair[1] <= 30
  if (!Array.isArray(intervals) || intervals.length > 12) throw new Error('intervals is a list of at most 12 [start, end] pairs (visualization cap).')
  let previousEnd = 0
  for (const pair of intervals) {
    if (!valid(pair)) throw new Error('Each interval is [start, end] with integers 0 <= start < end <= 30 (visualization cap).')
    if (pair[0] < previousEnd) throw new Error('intervals must be sorted and disjoint.')
    previousEnd = pair[1]
  }
  if (!valid(toBeRemoved)) throw new Error('toBeRemoved is [start, end] with integers 0 <= start < end <= 30 (visualization cap).')
  return { intervals, toBeRemoved }
}

export function buildTrace({ intervals, toBeRemoved }) {
  const [a, b] = toBeRemoved
  const result = []
  const frames = []
  const frame = (phase, activeLine, pythonLine, index, message) => frames.push({
    phase, activeLine, pythonLine, index, message, cut: [a, b], result: result.map(piece => [...piece]),
  })
  frame('start', L('const [a, b] = toBeRemoved'), P('a, b ='), -1, `Cut [${a}, ${b}) out of every interval.`)
  frame('start', L('const result = []'), P('result = []'), -1, 'Start with no surviving pieces.')
  intervals.forEach(([s, e], index) => {
    frame('scan', L('for (const [s, e] of intervals)'), P('for s, e in intervals'), index, `Look at [${s}, ${e}).`)
    if (e <= a || s >= b) {
      result.push([s, e])
      frame('keep', L('result.push([s, e])'), P('result.append([s, e])'), index, `[${s}, ${e}) misses the cut and stays whole.`)
      return
    }
    frame('scan', L('if (e <= a || s >= b)'), P('if e <= a or s >= b'), index, `[${s}, ${e}) overlaps the cut [${a}, ${b}).`)
    if (s < a) {
      result.push([s, a])
      frame('left', L('if (s < a)'), P('result.append([s, a])'), index, `Keep the left piece [${s}, ${a}).`)
    }
    if (b < e) {
      result.push([b, e])
      frame('right', L('if (b < e)'), P('result.append([b, e])'), index, `Keep the right piece [${b}, ${e}).`)
    }
    if (s >= a && e <= b) frame('gone', L('if (s < a)'), P('if s < a'), index, `[${s}, ${e}) lies inside the cut and disappears.`)
  })
  frame('done', L('return result'), P('return result'), -1, `${result.length} piece${result.length === 1 ? '' : 's'} survive, in order.`)
  return { input: { intervals, toBeRemoved }, result, frames }
}
