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

// Code panel: real JavaScript. Python below mirrors it line for line.
export const code = [
  "function maxFreeTime(eventTime, startTime, endTime) {",
  "  const meetings = startTime.map((s, i) => [s, endTime[i]]);",
  "  let best = Math.max(...gapsOf(meetings, eventTime));",
  "  meetings.forEach(([s, e], i) => {",
  "    const dur = e - s;",
  "    const rest = meetings.filter((_, k) => k !== i);",
  "    const gaps = gapsOf(rest, eventTime);",
  "    gaps.forEach((g, j) => {",
  "      if (g < dur) return;",
  "      const others = Math.max(...gaps.filter((_, k) => k !== j), 0);",
  "      best = Math.max(best, others, g - dur);",
  "    });",
  "  });",
  "  return best;",
  "}",
].map((text, index) => ({ line: index + 1, text }))
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
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function buildTrace(input) {
  const { eventTime, startTime, endTime } = input
  const meetings = startTime.map((s, i) => [s, endTime[i]])
  let best = Math.max(...gapsOf(meetings, eventTime))
  const frames = [{ pythonLine: PY('best = max(gaps_of'), activeLine: L('let best = Math.max'), phase: 'start', meeting: null, dur: null, gaps: gapsOf(meetings, eventTime), chosen: null, best,
    message: `Without moving anything the longest free stretch is ${best}.` }]
  meetings.forEach(([s, e], i) => {
    const dur = e - s
    const rest = meetings.filter((_, k) => k !== i)
    const gaps = gapsOf(rest, eventTime)
    frames.push({ pythonLine: PY('gaps = gaps_of(meetings[:i]'), activeLine: L('const rest = meetings'), phase: 'lift', meeting: i, dur, gaps, chosen: null, best,
      message: `Lift meeting ${i} (length ${dur}). The free stretches of the others are [${gaps.join(', ')}].` })
    let found = best
    gaps.forEach((g, j) => {
      if (g < dur) return
      const others = Math.max(...gaps.filter((_, k) => k !== j), 0)
      found = Math.max(found, others, g - dur)
      frames.push({ pythonLine: PY('best = max(best, others'), activeLine: L('best = Math.max(best, others'), phase: 'fit', meeting: i, dur, gaps, chosen: j, best: found,
        message: `Gap ${j} (${g}) fits length ${dur}; placing meeting ${i} at its edge leaves ${g - dur} free there and ${others} elsewhere.` })
    })
    best = found
  })
  frames.push({ pythonLine: PY('return best'), activeLine: L('return best;'), phase: 'done', meeting: null, dur: null, gaps: [], chosen: null, best,
    message: `Longest free stretch after the move: ${best}.` })
  return { input, result: best, frames }
}
