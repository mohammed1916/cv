export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with an events array.')
  const { events } = data
  if (!Array.isArray(events) || events.length < 1 || events.length > 8) throw new Error('events must have 1 to 8 entries.')
  for (const e of events) {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(Number.isInteger)) throw new Error('Each event is a [startDay, endDay] pair of integers.')
    if (e[0] < 1 || e[1] > 30 || e[0] > e[1]) throw new Error('Days are integers from 1 to 30 with startDay at most endDay.')
  }
  return { events }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function maxEvents(events) {', 'import heapq'],
  ['  const evs = [...events].sort((a, b) => a[0] - b[0] || a[1] - b[1])', 'def max_events(events):'],
  ['  const heap = []', '    evs = sorted(events)'],
  ['  let day = 0, i = 0, count = 0', '    heap = []'],
  ['  while (i < evs.length || heap.length > 0) {', '    day = i = count = 0'],
  ['    if (heap.length === 0) day = Math.max(day, evs[i][0])', '    while i < len(evs) or heap:'],
  ['    while (i < evs.length && evs[i][0] <= day) {', '        if not heap: day = max(day, evs[i][0])'],
  ['      heap.push(evs[i][1]); heap.sort((a, b) => a - b); i++', '        while i < len(evs) and evs[i][0] <= day:'],
  ['    }', '            heapq.heappush(heap, evs[i][1]); i += 1'],
  ['    while (heap.length > 0 && heap[0] < day) heap.shift()', ''],
  ['    if (heap.length > 0) { heap.shift(); count++ }', '        while heap and heap[0] < day: heapq.heappop(heap)'],
  ['    day++', '        if heap: heapq.heappop(heap); count += 1'],
  ['  }', '        day += 1'],
  ['  return count', ''],
  ['}', '    return count'],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const ev = input.events
  const order = ev.map((e, i) => i).sort((a, b) => ev[a][0] - ev[b][0] || ev[a][1] - ev[b][1])
  const waiting = []
  let day = 0
  let next = 0
  let attended = 0
  const attendedIdx = []
  const frames = [{ phase: 'start', pythonLine: P('evs = sorted'), activeLine: L('const evs'), day, index: -1, attended, attendedIdx: [], message: 'Sort the events by start day. Walk through the days in order.' }]
  while (next < order.length || waiting.length > 0) {
    if (waiting.length === 0) day = Math.max(day, ev[order[next]][0])
    while (next < order.length && ev[order[next]][0] <= day) {
      waiting.push(order[next])
      next += 1
    }
    for (let k = waiting.length - 1; k >= 0; k--) if (ev[waiting[k]][1] < day) waiting.splice(k, 1)
    if (waiting.length > 0) {
      waiting.sort((a, b) => ev[a][1] - ev[b][1])
      const pick = waiting.shift()
      attended += 1
      attendedIdx.push(pick)
      frames.push({ phase: 'attend', pythonLine: P('if heap:'), activeLine: L('if (heap.length > 0)'), day, index: pick, attended, attendedIdx: [...attendedIdx], message: `Day ${day}: attend event ${pick} ${JSON.stringify(ev[pick])}, which ends soonest.` })
    }
    day += 1
  }
  frames.push({ phase: 'done', pythonLine: P('return count'), activeLine: L('return count'), day, index: -1, attended, attendedIdx: [...attendedIdx], message: `Maximum events attended: ${attended}.` })
  return { input, result: attended, frames }
}
