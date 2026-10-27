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

export const code = `minimum number of groups so that no group has two overlapping intervals
sort intervals by start, then by end
groups = empty list of last end times
for each interval (left, right) in that order
  find a group whose last end is before left, choosing the earliest-finishing one
  if one exists then set its last end to right
  otherwise add a new group with last end right
return the number of groups`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ intervals }) {
  const sorted = intervals.map(([l, r]) => [l, r]).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const ends = []
  const frames = [{ phase: 'start', activeLine: L('sort intervals by start'), index: -1, ends: [], group: -1, message: `Sort by start: ${sorted.map(([l, r]) => `[${l}, ${r}]`).join(' ')}. A group can take an interval only if its last end is before the interval starts.` }]
  for (let i = 0; i < sorted.length; i++) {
    const [left, right] = sorted[i]
    let best = -1
    for (let g = 0; g < ends.length; g++) if (ends[g] < left && (best === -1 || ends[g] < ends[best])) best = g
    if (best === -1) {
      ends.push(right)
      best = ends.length - 1
      frames.push({ phase: 'assign', activeLine: L('otherwise add a new group'), index: i, ends: [...ends], group: best, message: `[${left}, ${right}] overlaps every open group, so it opens group ${best + 1}.` })
    } else {
      ends[best] = right
      frames.push({ phase: 'assign', activeLine: L('if one exists then set its last end'), index: i, ends: [...ends], group: best, message: `[${left}, ${right}] fits after group ${best + 1}, whose last end was earlier, so the group now ends at ${right}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the number of groups'), index: -1, ends: [...ends], group: -1, message: `${ends.length} group(s) are needed.` })
  return { input: { intervals }, sorted, result: ends.length, frames }
}

export const python = `import heapq

def min_groups(intervals):
    ends = []
    for left, right in sorted(intervals):
        if ends and ends[0] < left:
            heapq.heapreplace(ends, right)
        else:
            heapq.heappush(ends, right)
    return len(ends)
`
