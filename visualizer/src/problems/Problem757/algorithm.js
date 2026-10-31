export const code = `function intersectionSizeTwo(intervals):
  sort intervals by end ascending, ties by start descending
  a = -1, b = -1 (the last two chosen points, a below b)
  chosen = empty list
  for each interval [s, e] in order:
    if s is greater than b then
      append e-1 and e to chosen
      set a = e-1 and b = e
    else if s is greater than a then
      p = e-1 if b equals e, otherwise e
      append p to chosen
      set a and b to the two values p and b in order
  return the size of chosen`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def intersection_size_two(intervals):
    intervals = sorted(intervals, key=lambda x: (x[1], -x[0]))
    a, b = -1, -1
    chosen = []
    for s, e in intervals:
        if s > b:
            chosen += [e - 1, e]
            a, b = e - 1, e
        elif s > a:
            p = e - 1 if b == e else e
            chosen.append(p)
            a, b = min(p, b), max(p, b)
    return len(chosen)`

export function parseInput(text) {
  const v = JSON.parse(text)
  if (!Array.isArray(v) || v.length < 1 || v.length > 40) throw new Error('Enter 1-40 intervals as [[start, end], ...] (visualization cap of 40).')
  for (const iv of v) if (!Array.isArray(iv) || iv.length !== 2 || iv.some(n => !Number.isInteger(n) || n < 0 || n > 100000000) || iv[0] >= iv[1]) throw new Error('Each interval must be [start, end] with integers 0 <= start < end <= 100,000,000.')
  return v.map(([s, e]) => [s, e])
}

export function buildTrace(intervals) {
  const sorted = intervals.map(iv => [...iv]).sort((x, y) => x[1] - y[1] || y[0] - x[0])
  const frames = [{ phase: 'start', activeLine: L('sort intervals'), pythonLine: 2, index: -1, a: null, b: null, chosen: [], message: 'Sort by right end ascending (ties: larger start first), so choosing the rightmost points helps all later intervals the most.' }]
  let a = -1, b = -1
  const chosen = []
  sorted.forEach(([s, e], index) => {
    frames.push({ phase: 'compare', activeLine: L('for each interval [s, e]'), pythonLine: 6, index, a, b, chosen: [...chosen], message: `Interval [${s}, ${e}]: the last two chosen points are ${a < 0 ? 'none' : a} and ${b < 0 ? 'none' : b}.` })
    if (s > b) {
      chosen.push(e - 1, e); a = e - 1; b = e
      frames.push({ phase: 'add2', activeLine: L('append e-1 and e'), pythonLine: 7, index, a, b, chosen: [...chosen], message: `Start ${s} is beyond both chosen points, so the interval holds none of them. Add its two rightmost points ${e - 1} and ${e}.` })
    } else if (s > a) {
      const p = b === e ? e - 1 : e
      chosen.push(p)
      const oldB = b
      a = Math.min(p, b); b = Math.max(p, b)
      frames.push({ phase: 'add1', activeLine: L('append p to chosen'), pythonLine: 11, index, a, b, chosen: [...chosen], message: `Only the chosen point ${oldB} lies inside (start ${s} is above the older point). Add one more: ${p}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('else if s is greater than a'), pythonLine: 9, index, a, b, chosen: [...chosen], message: `Both chosen points ${a} and ${b} are already at or after start ${s}: the interval is satisfied.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return the size of chosen'), pythonLine: 13, index: sorted.length - 1, a, b, chosen: [...chosen], message: `Minimum containing set size: ${chosen.length}.` })
  return { input: intervals, sorted, result: chosen.length, frames }
}
