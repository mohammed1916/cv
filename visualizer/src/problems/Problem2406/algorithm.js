const ERROR = 'Enter {"intervals":[[left,right],...]} with 1 to 10 intervals, where 1 <= left <= right <= 30.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.intervals)) throw new Error(ERROR)
  const { intervals } = value
  if (intervals.length < 1 || intervals.length > 10) throw new Error(ERROR)
  const ok = intervals.every(p => Array.isArray(p) && p.length === 2 && Number.isInteger(p[0]) && Number.isInteger(p[1]) && p[0] >= 1 && p[0] <= p[1] && p[1] <= 30)
  if (!ok) throw new Error(ERROR)
  return { intervals }
}

export function buildTrace({ intervals }) {
  const sorted = intervals.map(([l, r]) => [l, r]).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const ends = []
  const placed = [] // group number chosen for each interval, in sorted order
  const frames = [{ phase: 'start', pythonLine: P('ordered = sorted'), activeLine: L('const sorted ='), index: -1, ends: [], group: -1, placed: [], sorted, message: `Sort by start: ${sorted.map(([l, r]) => `[${l}, ${r}]`).join(' ')}. A group can take an interval only if its last end is before the interval starts.` }]
  for (let i = 0; i < sorted.length; i++) {
    const [left, right] = sorted[i]
    let best = -1
    for (let g = 0; g < ends.length; g++) if (ends[g] < left && (best === -1 || ends[g] < ends[best])) best = g
    if (best === -1) {
      ends.push(right)
      best = ends.length - 1
      placed.push(best)
      frames.push({ phase: 'assign', pythonLine: P('last_end.append(right)'), activeLine: L('lastEnd.push(right)'), index: i, ends: [...ends], group: best, placed: [...placed], sorted, message: `[${left}, ${right}] overlaps every open group, so it opens group ${best + 1}.` })
    } else {
      ends[best] = right
      placed.push(best)
      frames.push({ phase: 'assign', pythonLine: P('last_end[best] = right'), activeLine: L('lastEnd[best] = right'), index: i, ends: [...ends], group: best, placed: [...placed], sorted, message: `[${left}, ${right}] fits after group ${best + 1}, whose last end was earlier, so the group now ends at ${right}.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: P('return len(last_end)'), activeLine: L('return lastEnd.length'), index: -1, ends: [...ends], group: -1, placed: [...placed], sorted, message: `${ends.length} group(s) are needed.` })
  return { input: { intervals }, sorted, result: ends.length, frames }
}

export const code = `function minGroups(intervals) {
  const sorted = intervals.map(([l, r]) => [l, r]).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const lastEnd = []
  for (const [left, right] of sorted) {
    let best = -1
    for (let g = 0; g < lastEnd.length; g++) {
      if (lastEnd[g] < left && (best === -1 || lastEnd[g] < lastEnd[best])) best = g
    }
    if (best === -1) {
      lastEnd.push(right)
    } else {
      lastEnd[best] = right
    }
  }
  return lastEnd.length
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def min_groups(intervals):
    ordered = sorted(intervals)
    last_end = []
    for left, right in ordered:
        best = -1
        for g in range(len(last_end)):
            if last_end[g] < left and (best == -1 or last_end[g] < last_end[best]):
                best = g
        if best == -1:
            last_end.append(right)
        else:
            last_end[best] = right
    return len(last_end)
`
