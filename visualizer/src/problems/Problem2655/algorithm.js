// Pseudocode lines are looked up by a phrase, so a renamed line fails loudly instead of pointing at the wrong text.
const CODE = [
  'function uncoveredRanges(n, ranges) {',
  '  const sorted = [...ranges].sort((a, b) => a[0] - b[0] || a[1] - b[1]) // sort the covered ranges by their left end',
  '  const gaps = []; let cursor = 0 // set cursor to 0 and gaps to an empty list',
  '  for (const [l, r] of sorted) { // for each covered range [l, r] in sorted order',
  '    if (l > cursor) gaps.push([cursor, l - 1]) // if l is greater than cursor then add the gap',
  '    cursor = Math.max(cursor, r + 1) // set cursor to the larger of cursor and r plus 1',
  '  }',
  '  if (cursor <= n - 1) gaps.push([cursor, n - 1]) // if cursor is at most n - 1 then add the gap',
  '  return gaps // return gaps',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = phrase => {
  const found = CODE.findIndex(c => c.includes(phrase))
  if (found < 0) throw new Error(`Missing code line for "${phrase}"`)
  return found + 1
}

export const python = `def uncovered_ranges(n, ranges):
    gaps = []
    cursor = 0
    for l, r in sorted(ranges):
        if l > cursor:
            gaps.append([cursor, l - 1])
        cursor = max(cursor, r + 1)
    if cursor <= n - 1:
        gaps.append([cursor, n - 1])
    return gaps
`

const pythonLines = python.trim().split('\n')
const PY = phrase => {
  const found = pythonLines.findIndex(t => t.includes(phrase))
  if (found < 0) throw new Error(`Missing Python line for "${phrase}"`)
  return found + 1
}

export const phases = [
  { id: 'start', label: 'Sort', description: 'Order the covered ranges by their left end.' },
  { id: 'range', label: 'Next range', description: 'Compare the covered range with the cursor.' },
  { id: 'gap', label: 'Gap', description: 'The cursor sits before this range, so the cells between are uncovered.' },
  { id: 'cover', label: 'Advance', description: 'Move the cursor past the covered range.' },
  { id: 'tail', label: 'Tail', description: 'Cells after the last covered range are uncovered.' },
  { id: 'done', label: 'Result', description: 'Report every uncovered range.' },
]

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and ranges.')
  const { n, ranges } = input
  if (!Number.isInteger(n) || n < 1 || n > 30) throw new Error('n is an integer from 1 to 30.')
  if (!Array.isArray(ranges) || ranges.length > 12) throw new Error('ranges holds at most 12 pairs.')
  for (const pair of ranges) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isInteger)) throw new Error('Each range is [l, r] with integers.')
    const [l, r] = pair
    if (l < 0 || r > n - 1 || l > r) throw new Error('Each range needs 0 <= l <= r <= n - 1.')
  }
  return { n, ranges: ranges.map(([l, r]) => [l, r]) }
}

export function buildTrace({ n, ranges }) {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const gaps = []
  const frames = []
  let cursor = 0
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase,
    activeLine: L(line),
    pythonLine: PY(py),
    message,
    n,
    ranges: sorted.map(r => [...r]),
    index: extra.index ?? -1,
    cursor,
    gaps: gaps.map(g => [...g]),
    lastGap: extra.lastGap ?? null,
  })

  push('start', 'sort the covered ranges', 'for l, r in sorted(ranges)', `${sorted.length} covered range${sorted.length === 1 ? '' : 's'} sorted by left end. The cursor starts at 0.`)
  sorted.forEach(([l, r], index) => {
    push('range', 'for each covered range', 'for l, r in sorted(ranges)', `Look at [${l}, ${r}] against cursor ${cursor}.`, { index })
    if (l > cursor) {
      const gap = [cursor, l - 1]
      gaps.push(gap)
      push('gap', 'if l is greater than cursor', 'if l > cursor', `Cells ${gap[0]} to ${gap[1]} are uncovered, so add [${gap[0]}, ${gap[1]}].`, { index, lastGap: gap })
    } else {
      push('gap', 'if l is greater than cursor', 'if l > cursor', `${l} is not after the cursor, so no gap sits before this range.`, { index })
    }
    cursor = Math.max(cursor, r + 1)
    push('cover', 'set cursor to the larger', 'cursor = max(cursor, r + 1)', `Cursor moves to ${cursor}, just past the covered cells up to ${r}.`, { index })
  })
  push('tail', 'if cursor is at most n - 1', 'if cursor <= n - 1', cursor <= n - 1 ? `Cells ${cursor} to ${n - 1} are uncovered.` : 'The covered ranges reach the end, so no tail gap exists.', { lastGap: cursor <= n - 1 ? [cursor, n - 1] : null })
  if (cursor <= n - 1) gaps.push([cursor, n - 1])
  push('done', 'return gaps', 'return gaps', gaps.length ? `${gaps.length} uncovered range${gaps.length === 1 ? '' : 's'} found.` : 'Every cell is covered.')
  return { input: { n, ranges: ranges.map(r => [...r]) }, result: gaps, frames }
}
