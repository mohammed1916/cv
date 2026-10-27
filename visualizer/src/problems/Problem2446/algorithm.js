const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with event1 and event2.')
  const { event1, event2 } = data
  for (const event of [event1, event2]) {
    if (!Array.isArray(event) || event.length !== 2 || !event.every(t => typeof t === 'string' && TIME.test(t))) {
      throw new Error('Each event is ["HH:MM", "HH:MM"] with 24-hour times.')
    }
    if (minutes(event[0]) > minutes(event[1])) throw new Error('Each event must start no later than it ends.')
  }
  return { event1, event2 }
}

const minutes = text => Number(text.slice(0, 2)) * 60 + Number(text.slice(3, 5))

export function buildTrace(input) {
  const { event1, event2 } = input
  const start1 = minutes(event1[0])
  const end1 = minutes(event1[1])
  const start2 = minutes(event2[0])
  const end2 = minutes(event2[1])
  const frames = [{ phase: 'start', activeLine: L('convert each time'), minutes: [start1, end1, start2, end2], first: null, second: null, message: 'Convert each time to minutes after midnight.' }]
  const first = start1 <= end2
  frames.push({ phase: 'compare', activeLine: L('set first overlap check'), minutes: [start1, end1, start2, end2], first, second: null, message: `Event 1 starts at or before event 2 ends: ${first}.` })
  const second = start2 <= end1
  frames.push({ phase: 'compare', activeLine: L('set second overlap check'), minutes: [start1, end1, start2, end2], first, second, message: `Event 2 starts at or before event 1 ends: ${second}.` })
  const result = first && second
  frames.push({ phase: 'done', activeLine: L('  return true'), minutes: [start1, end1, start2, end2], first, second, message: result ? 'Both checks hold, so the events share a minute.' : 'A check fails, so the events do not share a minute.' })
  return { input, result, frames }
}

export const code = `do the two closed time ranges share any minute
  convert each time to minutes after midnight
  set first overlap check to start1 is at most end2
  set second overlap check to start2 is at most end1
  if the first overlap check fails then return false
  if the second overlap check fails then return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def has_conflict(event1, event2):
    def minutes(text):
        return int(text[:2]) * 60 + int(text[3:5])

    start1, end1 = minutes(event1[0]), minutes(event1[1])
    start2, end2 = minutes(event2[0]), minutes(event2[1])
    first = start1 <= end2
    second = start2 <= end1
    return first and second
`
