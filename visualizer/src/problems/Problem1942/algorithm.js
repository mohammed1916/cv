// LeetCode 1942: replay arrivals and departures in time order. A departure at a moment frees its chair before any arrival at that moment; each arrival takes the lowest free chair.
const SOURCE = [
  "function smallestChair(times, targetFriend) {",
  "  const events = []",
  "  times.forEach(([arrive, leave], i) => {",
  "    events.push({ time: arrive, kind: 1, friend: i })",
  "    events.push({ time: leave, kind: 0, friend: i })",
  "  })",
  "  events.sort((a, b) => a.time - b.time || a.kind - b.kind || a.friend - b.friend)",
  "  const free = []",
  "  let nextNew = 0",
  "  const chairOf = new Map()",
  "  for (const ev of events) {",
  "    if (ev.kind === 0) {",
  "      free.push(chairOf.get(ev.friend))",
  "      free.sort((a, b) => a - b)",
  "      continue",
  "    }",
  "    const chair = free.length ? free.shift() : nextNew++",
  "    chairOf.set(ev.friend, chair)",
  "    if (ev.friend === targetFriend) return chair",
  "  }",
  "  return null",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def smallest_chair(times, target_friend):
    events = []
    for i, (arrive, leave) in enumerate(times):
        events.append((arrive, 1, i))
        events.append((leave, 0, i))
    events.sort()
    free = []
    next_new = 0
    chair_of = {}
    for time, kind, friend in events:
        if kind == 0:
            free.append(chair_of[friend])
            free.sort()
        else:
            if free:
                chair = free.pop(0)
            else:
                chair = next_new
                next_new += 1
            chair_of[friend] = chair
            if friend == target_friend:
                return chair
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'replay', label: 'Replay events', description: 'Process departures before arrivals at the same moment.' },
  { id: 'done', label: 'Result', description: 'Chair of the target friend.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"times":[[1,4],[2,3],[4,6]],"targetFriend":1}.') }
  const { times, targetFriend } = input || {}
  if (!Array.isArray(times) || times.length < 2 || times.length > 8) throw new Error('times holds 2 to 8 [arrival, leaving] pairs.')
  if (!times.every(t => Array.isArray(t) && t.length === 2 && Number.isInteger(t[0]) && Number.isInteger(t[1]) && t[0] >= 1 && t[1] > t[0] && t[1] <= 30)) throw new Error('Each pair is [arrival, leaving] with 1 <= arrival < leaving <= 30.')
  const arrivals = new Set(times.map(t => t[0]))
  if (arrivals.size !== times.length) throw new Error('Arrival times are distinct.')
  if (!Number.isInteger(targetFriend) || targetFriend < 0 || targetFriend >= times.length) throw new Error('targetFriend is an index into times.')
  return { times, targetFriend }
}

export function buildTrace({ times, targetFriend }) {
  const events = []
  times.forEach(([arrive, leave], i) => { events.push({ time: arrive, kind: 1, friend: i }); events.push({ time: leave, kind: 0, friend: i }) })
  events.sort((a, b) => a.time - b.time || a.kind - b.kind || a.friend - b.friend)
  const free = []
  let nextNew = 0
  const chairOf = new Map()
  const occupied = new Map()
  const frames = []
  let result = null
  for (const ev of events) {
    if (ev.kind === 0) {
      const chair = chairOf.get(ev.friend)
      free.push(chair)
      free.sort((a, b) => a - b)
      occupied.delete(chair)
      frames.push({ phase: 'replay', activeLine: L('free.push(chairOf.get(ev.friend))'), pythonLine: P('free.append'), message: `Friend ${ev.friend} leaves at ${ev.time}; chair ${chair} is free again.`, event: ev, chairOf: Object.fromEntries(chairOf), occupied: Object.fromEntries(occupied), chosen: null, result: null })
      continue
    }
    const chair = free.length ? free.shift() : nextNew++
    chairOf.set(ev.friend, chair)
    occupied.set(chair, ev.friend)
    frames.push({ phase: 'replay', activeLine: L('free.length ? free.shift()'), pythonLine: P('chair = free.pop(0)'), message: `Friend ${ev.friend} arrives at ${ev.time} and takes chair ${chair}.`, event: ev, chairOf: Object.fromEntries(chairOf), occupied: Object.fromEntries(occupied), chosen: chair, result: null })
    if (ev.friend === targetFriend) { result = chair; frames.push({ phase: 'done', activeLine: L('return chair'), pythonLine: P('return chair'), message: `Friend ${targetFriend} sits on chair ${chair}.`, event: ev, chairOf: Object.fromEntries(chairOf), occupied: Object.fromEntries(occupied), chosen: chair, result: chair }); break }
  }
  return { input: { times, targetFriend }, result, frames }
}
