// Each event is a closed range of minutes. Two closed ranges share a minute when each starts no later than the other ends.
const CODE = [
  'function haveConflict(event1, event2) {',
  '  const [start1, end1] = event1.map(toMinutes)',
  '  const [start2, end2] = event2.map(toMinutes)',
  '  const first = start1 <= end2',
  '  const second = start2 <= end1',
  '  return first && second',
  '}',
]

const PY = [
  'def have_conflict(event1, event2):',
  '    def to_minutes(text):',
  '        return int(text[:2]) * 60 + int(text[3:5])',
  '    start1, end1 = map(to_minutes, event1)',
  '    start2, end2 = map(to_minutes, event2)',
  '    first = start1 <= end2',
  '    second = start2 <= end1',
  '    return first and second',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Convert', description: 'Turn each time into minutes after midnight.' },
  { id: 'compare', label: 'Compare', description: 'Check whether one event starts no later than the other one ends.' },
  { id: 'done', label: 'Complete', description: 'Report whether the two events share a minute.' },
]

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

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/

function minutes(text) {
  return Number(text.slice(0, 2)) * 60 + Number(text.slice(3, 5))
}

export function buildTrace(input) {
  const { event1, event2 } = input
  const start1 = minutes(event1[0])
  const end1 = minutes(event1[1])
  const start2 = minutes(event2[0])
  const end2 = minutes(event2[1])
  const frames = [{ phase: 'start', pythonLine: pyLine('start1, end1 = map(to_minutes, event1)'), activeLine: codeLine('const [start1, end1] = event1.map(toMinutes)'), minutes: [start1, end1, start2, end2], first: null, second: null, message: 'Convert each time to minutes after midnight.' }]
  const first = start1 <= end2
  frames.push({ phase: 'compare', activeLine: codeLine('const first = start1 <= end2'), pythonLine: pyLine('first = start1 <= end2'), minutes: [start1, end1, start2, end2], first, second: null, message: `Event 1 starts at or before event 2 ends: ${first}.` })
  const second = start2 <= end1
  frames.push({ phase: 'compare', activeLine: codeLine('const second = start2 <= end1'), pythonLine: pyLine('second = start2 <= end1'), minutes: [start1, end1, start2, end2], first, second, message: `Event 2 starts at or before event 1 ends: ${second}.` })
  const result = first && second
  frames.push({ phase: 'done', pythonLine: pyLine('return first and second'), activeLine: codeLine('return first && second'), minutes: [start1, end1, start2, end2], first, second, message: result ? 'Both checks hold, so the events share a minute.' : 'A check fails, so the events do not share a minute.' })
  return { input, result, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
