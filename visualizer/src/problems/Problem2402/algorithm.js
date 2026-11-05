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
  const schedule = []
  const frames = [{ phase: 'start', pythonLine: P('count = [0] * n'), activeLine: L('const count = Array(n)'), room: -1, count: [...count], schedule: [], message: `${n} rooms, all free.` }]
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
    schedule.push({ room, start: finish - duration, end: finish, from: start, to: end })
    frames.push({ phase, pythonLine: P(phase === 'use' ? 'room = heapq.heappop(free)' : 'ready, room = heapq.heappop(busy)'), activeLine: L(phase === 'use' ? 'if (free.length)' : 'let at = 0'), room, count: [...count], schedule: schedule.map(s => ({ ...s })), message: phase === 'use' ? `Meeting ${start}-${end} takes room ${room}.` : `No room is free, so meeting ${start}-${end} starts at ${finish - duration} in room ${room}.` })
  }
  const best = Math.max(...count)
  const result = count.indexOf(best)
  frames.push({ phase: 'done', pythonLine: P('return count.index(max(count))'), activeLine: L('return count.indexOf'), room: result, count: [...count], schedule: schedule.map(s => ({ ...s })), message: `Room ${result} held the most meetings (${best}).` })
  return { input: { n, meetings }, result, frames }
}

export const code = `function mostBookedRoom(n, meetings) {
  const count = Array(n).fill(0)
  const free = Array.from({ length: n }, (_, i) => i) // rooms that are free now
  const busy = [] // { end, room } for rooms in use or delayed
  for (const [start, end] of [...meetings].sort((a, b) => a[0] - b[0])) {
    for (let j = busy.length - 1; j >= 0; j--) {
      if (busy[j].end <= start) {
        free.push(busy[j].room)
        busy.splice(j, 1)
      }
    }
    free.sort((a, b) => a - b)
    const duration = end - start
    let room
    let finish
    if (free.length) {
      room = free.shift()
      finish = end
    } else {
      let at = 0
      for (let j = 1; j < busy.length; j++) {
        if (busy[j].end < busy[at].end || (busy[j].end === busy[at].end && busy[j].room < busy[at].room)) at = j
      }
      room = busy[at].room
      finish = busy[at].end + duration
      busy.splice(at, 1)
    }
    count[room]++
    busy.push({ end: finish, room })
  }
  return count.indexOf(Math.max(...count))
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

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
