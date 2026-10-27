import { intervalView } from '../../components/shared/intervalModel.js'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter an object with days and meetings.')
  const { days, meetings } = input
  if (!Number.isInteger(days) || days < 1 || days > 30) throw new Error('days is an integer from 1 to 30.')
  if (!Array.isArray(meetings) || meetings.length < 1 || meetings.length > 8) throw new Error('Enter 1 to 8 meetings as [start, end] pairs.')
  for (const m of meetings) {
    if (!Array.isArray(m) || m.length !== 2 || !m.every(Number.isInteger) || m[0] < 1 || m[0] > m[1] || m[1] > days) throw new Error('Each meeting is [start, end] with 1 <= start <= end <= days.')
  }
  return { days, meetings }
}

export function buildTrace({ days, meetings }) {
  const sorted = meetings.map(m => m.slice()).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  let covered = 0
  let curStart = null, curEnd = null
  const busy = Array(days).fill(false)
  const frames = [{ phase: 'start', meeting: null, covered, busy: busy.slice(), activeLine: L('set covered to 0'), message: `${days} days. Merge the meetings to count the busy days.`, sorted }]
  const markBusy = (s, e) => { for (let d = s; d <= e; d++) busy[d - 1] = true }
  for (const [s, e] of sorted) {
    if (curStart === null) {
      curStart = s; curEnd = e
    } else if (s > curEnd) {
      covered += curEnd - curStart + 1
      markBusy(curStart, curEnd)
      curStart = s; curEnd = e
    } else {
      curEnd = Math.max(curEnd, e)
    }
    frames.push({ phase: 'merge', meeting: [s, e], covered: covered + (curEnd - curStart + 1), busy: busy.slice(), activeLine: L('extend the current block'), message: `Meeting [${s}, ${e}] is folded into the current busy block [${curStart}, ${curEnd}].`, sorted })
  }
  covered += curEnd - curStart + 1
  markBusy(curStart, curEnd)
  const result = days - covered
  frames.push({ phase: 'done', meeting: null, covered, busy: busy.slice(), activeLine: L('return days minus covered'), message: `${covered} busy day(s), so ${result} free.`, sorted })
  return { input: { days, meetings }, result, frames }
}

export const code = `count the days with no meeting
  sort the meetings by their start day
  set covered to 0 and no current block
  for each meeting [s, e] in order
    if there is no current block then start one at s and e
    otherwise if s is after the current block then
      add the block length to covered and start a new block at s and e
    otherwise extend the current block: its end becomes the larger end
  add the last block length to covered
  return days minus covered`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_days(days, meetings):
    covered = 0
    cur_start = cur_end = None
    for s, e in sorted(meetings):
        if cur_start is None:
            cur_start, cur_end = s, e
        elif s > cur_end:
            covered += cur_end - cur_start + 1
            cur_start, cur_end = s, e
        else:
            cur_end = max(cur_end, e)
    covered += cur_end - cur_start + 1
    return days - covered
`

export function viewFor(run, step) {
  const intervals = (step.sorted ?? []).map(([start, end]) => ({ start, end, role: 'kept' }))
  if (step.meeting) {
    const i = intervals.findIndex(m => m.start === step.meeting[0] && m.end === step.meeting[1])
    if (i >= 0) intervals[i] = { ...intervals[i], role: 'current' }
  }
  return intervalView({ title: 'Meetings', intervals, closed: true, note: step.message }).interval
}
