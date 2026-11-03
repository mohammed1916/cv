// LeetCode 1229: Meeting Scheduler. Sort both availability lists, then walk two pointers.
// Each step compares the overlap of the current pair. The slot that ends first cannot
// overlap anything later in the other person's list, so it is advanced.

export const phases = [
  { id: 'setup', label: 'Sort', description: 'Order both availability lists by start time.' },
  { id: 'overlap', label: 'Overlap', description: 'Measure the overlap of the current pair.' },
  { id: 'advance', label: 'Advance', description: 'Move past the slot that ends first.' },
  { id: 'found', label: 'Found', description: 'The overlap holds the duration.' },
  { id: 'done', label: 'Result', description: 'Report the meeting or an empty list.' },
]

export const code = `FUNCTION earliestMeeting(slots1, slots2, duration)
    sort slots1 and slots2 by start
    i ← 0; j ← 0
    WHILE i < length of slots1 AND j < length of slots2
        start ← max(slots1[i].start, slots2[j].start)
        end ← min(slots1[i].end, slots2[j].end)
        IF end - start ≥ duration THEN RETURN [start, start + duration]
        IF slots1[i].end < slots2[j].end THEN i ← i + 1 ELSE j ← j + 1
    RETURN empty list`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def earliest_meeting(slots1, slots2, duration):
    slots1 = sorted(slots1)
    slots2 = sorted(slots2)
    i, j = 0, 0
    while i < len(slots1) and j < len(slots2):
        start = max(slots1[i][0], slots2[j][0])
        end = min(slots1[i][1], slots2[j][1])
        if end - start >= duration:
            return [start, start + duration]
        if slots1[i][1] < slots2[j][1]:
            i += 1
        else:
            j += 1
    return []


if __name__ == "__main__":
    import sys, json
    data = json.loads(sys.stdin.read())
    print(json.dumps(earliest_meeting(data["slots1"], data["slots2"], data["duration"])))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

const MAX_SLOTS = 10

function checkSlots(name, slots) {
  if (!Array.isArray(slots) || slots.length < 1 || slots.length > MAX_SLOTS) throw new Error(`${name} lists 1 to ${MAX_SLOTS} slots.`)
  for (const slot of slots) {
    if (!Array.isArray(slot) || slot.length !== 2 || !slot.every(Number.isInteger)) throw new Error(`Each slot in ${name} is [start, end] integers.`)
    if (slot[0] >= slot[1]) throw new Error(`Each slot in ${name} starts before it ends.`)
  }
  const sorted = slots.slice().sort((a, b) => a[0] - b[0])
  for (let k = 1; k < sorted.length; k += 1) {
    if (sorted[k][0] < sorted[k - 1][1]) throw new Error(`Slots in ${name} must not overlap each other.`)
  }
  return sorted
}

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with slots1, slots2 and duration.')
  const { slots1, slots2, duration } = input
  checkSlots('slots1', slots1)
  checkSlots('slots2', slots2)
  if (!Number.isInteger(duration) || duration < 1) throw new Error('duration is a positive integer.')
  return { slots1: slots1.slice().sort((a, b) => a[0] - b[0]), slots2: slots2.slice().sort((a, b) => a[0] - b[0]), duration }
}

export function buildTrace({ slots1, slots2, duration }) {
  const frames = []
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    i: -1, j: -1, start: null, end: null, meeting: null, moved: null, ...extra,
  })
  emit('setup', 'sort slots1 and slots2 by start', 'slots1 = sorted(slots1)', `Two lists with ${slots1.length} and ${slots2.length} slots; the meeting needs ${duration} minutes.`)
  let i = 0
  let j = 0
  let meeting = null
  while (i < slots1.length && j < slots2.length) {
    const start = Math.max(slots1[i][0], slots2[j][0])
    const end = Math.min(slots1[i][1], slots2[j][1])
    emit('overlap', 'start ← max(slots1[i].start, slots2[j].start)', 'start = max(slots1[i][0], slots2[j][0])',
      `Pair ${JSON.stringify(slots1[i])} and ${JSON.stringify(slots2[j])} overlaps from ${start} to ${end}.`, { i, j, start, end })
    if (end - start >= duration) {
      meeting = [start, start + duration]
      emit('found', 'IF end - start ≥ duration', 'if end - start >= duration', `The overlap is ${end - start} long, so the meeting is ${meeting[0]} to ${meeting[1]}.`, { i, j, start, end, meeting })
      break
    }
    const endsFirst = slots1[i][1] < slots2[j][1] ? 'first' : 'second'
    emit('advance', 'IF slots1[i].end < slots2[j].end', 'if slots1[i][1] < slots2[j][1]',
      `The overlap is ${Math.max(0, end - start)} long, too short. The ${endsFirst === 'first' ? 'first' : 'second'} slot ends first, so advance it.`, { i, j, start, end, moved: endsFirst })
    if (endsFirst === 'first') i += 1
    else j += 1
  }
  emit('done', meeting ? 'RETURN [start, start + duration]' : 'RETURN empty list',
    meeting ? 'return [start, start + duration]' : 'return []',
    meeting ? `Earliest meeting: ${meeting[0]} to ${meeting[1]}.` : 'No pair of slots holds the duration.', { meeting })
  return { input: { slots1, slots2, duration }, result: meeting ?? [], frames }
}
