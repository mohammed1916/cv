export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with eventTime, startTime and endTime.')
  const { eventTime, startTime, endTime } = input
  if (!Number.isInteger(eventTime) || eventTime < 1 || eventTime > 30) throw new Error('eventTime is an integer from 1 to 30.')
  if (!Array.isArray(startTime) || !Array.isArray(endTime) || startTime.length !== endTime.length) throw new Error('startTime and endTime must be arrays of the same length.')
  if (startTime.length < 2 || startTime.length > 8) throw new Error('Use 2 to 8 meetings.')
  let last = 0
  for (let i = 0; i < startTime.length; i++) {
    const s = startTime[i]
    const e = endTime[i]
    if (!Number.isInteger(s) || !Number.isInteger(e) || s < 0 || e > eventTime || s >= e) throw new Error(`Meeting ${i} must satisfy 0 <= start < end <= eventTime.`)
    if (s < last) throw new Error('Meetings must be sorted by start and must not overlap.')
    last = e
  }
  return { eventTime, startTime, endTime }
}

// Free stretches between meetings, including the stretch before the first and after the last.
function gapsOf(meetings, eventTime) {
  const gaps = []
  let cursor = 0
  for (const [s, e] of meetings) {
    gaps.push(s - cursor)
    cursor = e
  }
  gaps.push(eventTime - cursor)
  return gaps
}

export function buildTrace(input) {
  const { eventTime, startTime, endTime } = input
  const meetings = startTime.map((s, i) => [s, endTime[i]])
  let best = Math.max(...gapsOf(meetings, eventTime))
  const frames = [{ phase: 'start', activeLine: L('best = largest gap with no move'), meeting: null, best, message: `Without moving anything the longest free stretch is ${best}.` }]
  meetings.forEach(([s, e], i) => {
    const dur = e - s
    const rest = meetings.filter((_, k) => k !== i)
    const gaps = gapsOf(rest, eventTime)
    let found = best
    gaps.forEach((g, j) => {
      if (g < dur) return
      const others = Math.max(...gaps.filter((_, k) => k !== j), 0)
      found = Math.max(found, others, g - dur)
    })
    best = found
    frames.push({ phase: 'move', activeLine: L('for each meeting i'), meeting: i, best, message: `Move meeting ${i} (length ${dur}) into the best gap. Longest free stretch so far: ${best}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), meeting: null, best, message: `Longest free stretch after the move: ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest free stretch after moving at most one meeting:
  gaps = free stretches between the meetings, including both ends
  best = largest gap with no move
  for each meeting i:
    remove meeting i and find the gaps of the rest
    for each gap g that is at least as long as meeting i:
      best = max(best, largest other gap, g - duration of i)
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_free_time(eventTime, startTime, endTime):
    def gaps_of(meetings):
        out = []
        cursor = 0
        for s, e in sorted(meetings):
            out.append(s - cursor)
            cursor = e
        out.append(eventTime - cursor)
        return out

    meetings = list(zip(startTime, endTime))
    best = max(gaps_of(meetings))
    for i, (s, e) in enumerate(meetings):
        dur = e - s
        gaps = gaps_of(meetings[:i] + meetings[i + 1:])
        for j, g in enumerate(gaps):
            if g >= dur:
                others = max(gaps[:j] + gaps[j + 1:], default=0)
                best = max(best, others, g - dur)
    return best
`
