import { intervalView } from '../../components/shared/intervalModel.js'

export const MOD = 1000000007n

export function parseInput(text) {
  const ranges = JSON.parse(text)
  if (!Array.isArray(ranges) || ranges.length < 1 || ranges.length > 10) throw new Error('Enter 1 to 10 ranges as [left, right] pairs.')
  for (const r of ranges) {
    if (!Array.isArray(r) || r.length !== 2 || !r.every(v => Number.isInteger(v) && v >= 0 && v <= 20) || r[0] > r[1]) throw new Error('Each range is [left, right] with 0 <= left <= right <= 20.')
  }
  return ranges
}

export function buildTrace(ranges) {
  const sorted = ranges.map((r, index) => ({ index, start: r[0], end: r[1] })).sort((a, b) => a.start - b.start || a.end - b.end)
  const groupOf = Array(ranges.length).fill(0)
  let groups = 0, curEnd = null, curGroup = 0
  const frames = [{ phase: 'start', index: null, groups: 0, groupOf: groupOf.slice(), sorted, activeLine: L('set groups to 0'), message: 'Sort the ranges by start. Overlapping ranges share a group, so only the number of merged components matters.' }]
  for (const item of sorted) {
    if (curEnd === null || item.start > curEnd) {
      groups++
      curGroup = groups
      curEnd = item.end
      frames.push({ phase: 'new', index: item.index, groups, groupOf: groupOf.slice(), sorted, activeLine: L('start a new component'), message: `Range [${item.start}, ${item.end}] starts a new component: ${groups} so far.` })
    } else {
      curEnd = Math.max(curEnd, item.end)
      frames.push({ phase: 'join', index: item.index, groups, groupOf: groupOf.slice(), sorted, activeLine: L('extend the component'), message: `Range [${item.start}, ${item.end}] shares a point with the current component, so it joins it.` })
    }
    groupOf[item.index] = curGroup
  }
  const result = Number((2n ** BigInt(groups)) % MOD)
  frames.push({ phase: 'done', index: null, groups, groupOf: groupOf.slice(), sorted, activeLine: L('return 2 to the power'), message: `${groups} component(s), so ${result} ways.`, result })
  return { input: ranges, result, frames }
}

export const code = `count ways to split the ranges into two groups
  sort the ranges by their left end
  set groups to 0 and curEnd to nothing
  for each range [s, e] in order
    if curEnd is nothing or s is greater than curEnd then
      start a new component: add 1 to groups and set curEnd to e
    otherwise
      extend the component: set curEnd to the larger of curEnd and e
  return 2 to the power groups, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_ways(ranges):
    MOD = 1000000007
    groups = 0
    cur_end = None
    for s, e in sorted(ranges):
        if cur_end is None or s > cur_end:
            groups += 1
            cur_end = e
        else:
            cur_end = max(cur_end, e)
    return pow(2, groups, MOD)
`

export function viewFor(run, step) {
  const intervals = run.input.map(([start, end], i) => ({
    start, end, group: step.groupOf[i] ? `group ${step.groupOf[i]}` : 'unassigned',
    role: i === step.index ? 'current' : step.groupOf[i] ? 'kept' : 'pending',
  }))
  return intervalView({ title: 'Ranges and their components', intervals, closed: true, note: step.message }).interval
}
