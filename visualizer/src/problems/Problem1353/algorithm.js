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

export function buildTrace(input) {
  const ev = input.events
  const order = ev.map((e, i) => i).sort((a, b) => ev[a][0] - ev[b][0] || ev[a][1] - ev[b][1])
  const waiting = []
  let day = 0
  let next = 0
  let attended = 0
  const attendedIdx = []
  const frames = [{ phase: 'start', activeLine: L('sort the events by start day'), day, index: -1, attended, attendedIdx: [], message: 'Sort the events by start day. Walk through the days in order.' }]
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
      frames.push({ phase: 'attend', activeLine: L('attend the one ending soonest'), day, index: pick, attended, attendedIdx: [...attendedIdx], message: `Day ${day}: attend event ${pick} ${JSON.stringify(ev[pick])}, which ends soonest.` })
    }
    day += 1
  }
  frames.push({ phase: 'done', activeLine: L('return attended'), day, index: -1, attended, attendedIdx: [...attendedIdx], message: `Maximum events attended: ${attended}.` })
  return { input, result: attended, frames }
}

export const code = `maximum number of events attended, at most one per day:
  sort the events by start day
  set day to zero, attended to zero, and waiting to an empty list
  while events remain or the waiting list is not empty
    if the waiting list is empty then jump day forward to the next start day
    add every event that has started by this day to the waiting list
    drop waiting events that ended before this day
    if the waiting list is not empty then attend the one ending soonest and add one to attended
    move to the next day
  return attended`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def max_events(events):
    evs = sorted(events)
    heap = []
    day = 0
    i = 0
    count = 0
    while i < len(evs) or heap:
        if not heap:
            day = max(day, evs[i][0])
        while i < len(evs) and evs[i][0] <= day:
            heapq.heappush(heap, evs[i][1])
            i += 1
        while heap and heap[0] < day:
            heapq.heappop(heap)
        if heap:
            heapq.heappop(heap)
            count += 1
        day += 1
    return count
`
