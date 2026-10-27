export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, meetings } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error('"n" is an integer from 1 to 5 in this visualization.')
  if (!Array.isArray(meetings) || meetings.length < 1 || meetings.length > 10) throw new Error('Use "meetings" as an array of 1 to 10 [start, end] pairs.')
  const starts = new Set()
  for (const pair of meetings) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isInteger)) throw new Error('Each meeting is a pair of integers [start, end].')
    const [s, e] = pair
    if (s < 0 || s > 30 || e <= s || e > 40) throw new Error('Each meeting needs 0 <= start < end <= 40 with start at most 30.')
    if (starts.has(s)) throw new Error('Meeting start times must be distinct.')
    starts.add(s)
  }
  return { n, meetings }
}

export function buildTrace({ n, meetings }) {
  const sorted = meetings.map(([s, e]) => [s, e]).sort((a, b) => a[0] - b[0])
  const count = Array(n).fill(0)
  const free = Array.from({ length: n }, (_, i) => i)
  const busy = []
  const frames = [{ phase: 'start', activeLine: L('set the count of each room to 0'), room: -1, count: [...count], message: `${n} rooms, all free.` }]
  for (const [start, end] of sorted) {
    for (let j = busy.length - 1; j >= 0; j--) {
      if (busy[j].end <= start) { free.push(busy[j].room); busy.splice(j, 1) }
    }
    free.sort((a, b) => a - b)
    const duration = end - start
    let room, finish, phase
    if (free.length) {
      room = free.shift()
      finish = end
      phase = 'use'
    } else {
      let at = 0
      for (let j = 1; j < busy.length; j++) {
        if (busy[j].end < busy[at].end || (busy[j].end === busy[at].end && busy[j].room < busy[at].room)) at = j
      }
      room = busy[at].room
      finish = busy[at].end + duration
      busy.splice(at, 1)
      phase = 'wait'
    }
    count[room]++
    busy.push({ end: finish, room })
    frames.push({ phase, activeLine: L(phase === 'use' ? 'use the lowest numbered free room' : 'wait for the room that frees first'), room, count: [...count], message: phase === 'use' ? `Meeting ${start}-${end} takes room ${room}.` : `No room is free, so meeting ${start}-${end} starts at ${finish - duration} in room ${room}.` })
  }
  const best = Math.max(...count)
  const result = count.indexOf(best)
  frames.push({ phase: 'done', activeLine: L('return the room with the highest count'), room: result, count: [...count], message: `Room ${result} held the most meetings (${best}).` })
  return { input: { n, meetings }, result, frames }
}

export const code = `most booked room among n rooms for the given meetings
  set the count of each room to 0
  sort meetings by start time
  for each meeting with start s and end e
    free every room whose meeting ended by s
    if a room is free then use the lowest numbered free room
    otherwise wait for the room that frees first, and that room starts the meeting when it frees
    add 1 to the count of the room used
  return the room with the highest count, lowest number on ties`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def most_booked_room(n, meetings):
    count = [0] * n
    free = list(range(n))
    busy = []
    for start, end in sorted(meetings):
        while busy and busy[0][0] <= start:
            _, room = heapq.heappop(busy)
            heapq.heappush(free, room)
        duration = end - start
        if free:
            room = heapq.heappop(free)
            finish = end
        else:
            ready, room = heapq.heappop(busy)
            finish = ready + duration
        count[room] += 1
        heapq.heappush(busy, (finish, room))
    return count.index(max(count))
`
