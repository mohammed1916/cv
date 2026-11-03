export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no kept intervals and no furthest end yet.' },
  { id: 'sort', label: 'Sort', description: 'Order intervals by start ascending; for equal starts, longer intervals come first.' },
  { id: 'compare', label: 'Compare end', description: 'An interval is covered when its end does not pass the furthest end seen so far.' },
  { id: 'covered', label: 'Covered', description: 'This interval lies inside an earlier interval, so it is not counted.' },
  { id: 'keep', label: 'Keep', description: 'This interval extends past every earlier end, so it survives; update the furthest end.' },
  { id: 'done', label: 'Complete', description: 'Return how many intervals were kept.' },
]

export function parseInput(text) {
  const intervals = JSON.parse(text)
  if (!Array.isArray(intervals) || intervals.length < 1 || intervals.length > 30) throw new Error('Use a JSON array of 1 to 30 pairs, such as [[1, 4], [2, 3]].')
  if (!intervals.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isInteger) && p[0] >= 0 && p[0] <= p[1] && p[1] <= 100)) throw new Error('Each pair is [start, end] with integers 0 <= start <= end <= 100.')
  const keys = new Set(intervals.map(([a, b]) => `${a},${b}`))
  if (keys.size !== intervals.length) throw new Error('Intervals must be distinct so that each one is identifiable.')
  return intervals
}

export function buildTrace(intervals) {
  const items = intervals.map(([start, end], index) => ({ start, end, index })).sort((x, y) => x.start - y.start || y.end - x.end)
  const kept = []
  let maxEnd = null
  const snap = (current, covered) => ({
    order: items.map(it => ({ start: it.start, end: it.end, index: it.index })),
    current, maxEnd, kept: [...kept], covered,
  })
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), pythonLine: P('count = 0'), snapshot: snap(null, null), message: `${intervals.length} distinct intervals. Sorting first lets each one be checked against earlier ones only.` }]
  frames.push({ phase: 'sort', activeLine: L('sort intervals by'), pythonLine: P('intervals.sort'), snapshot: snap(null, null), message: 'Sorted by start ascending, and longer intervals first when starts tie.' })
  for (const it of items) {
    frames.push({ phase: 'compare', activeLine: L('if max_end exists'), pythonLine: P('end <= max_end'), snapshot: snap(it.index, null), message: `Interval [${it.start}, ${it.end}] is compared with the furthest end ${maxEnd === null ? 'none yet' : maxEnd}.` })
    if (maxEnd !== null && it.end <= maxEnd) {
      frames.push({ phase: 'covered', activeLine: L('skip it'), pythonLine: P('continue'), snapshot: snap(it.index, true), message: `[${it.start}, ${it.end}] ends by ${maxEnd}, so an earlier interval covers it.` })
    } else {
      kept.push(it.index)
      maxEnd = it.end
      frames.push({ phase: 'keep', activeLine: L('count = count + 1'), pythonLine: P('count += 1'), snapshot: snap(it.index, false), message: `[${it.start}, ${it.end}] reaches past the earlier ends, so it is kept. Furthest end is now ${maxEnd}.` })
    }
  }
  const result = kept.length
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), snapshot: snap(null, null), message: `${result} intervals are not covered by another interval.` })
  return { input: intervals, result, frames }
}

export const code = `count intervals that are not covered:
  set count to 0
  set max_end to nothing
  sort intervals by start ascending, then end descending
  for each interval [s, e] in that order:
    if max_end exists and e <= max_end:
      skip it, since an earlier interval covers it
    else:
      count = count + 1
      set max_end to e
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_uncovered(intervals):
    count = 0
    max_end = None
    intervals.sort(key=lambda p: (p[0], -p[1]))
    for start, end in intervals:
        if max_end is not None and end <= max_end:
            continue
        count += 1
        max_end = end
    return count
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
