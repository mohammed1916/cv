// Slowest key: the duration of press i is its release time minus the previous release time.
const JS_LINES = [
  { text: 'let best = keysPressed[0]', py: 'best = keysPressed[0]' },
  { text: 'let bestDuration = releaseTimes[0]', py: 'best_duration = releaseTimes[0]' },
  { text: 'for (let i = 1; i < keysPressed.length; i++) {', py: 'for i in range' },
  { text: 'const duration = releaseTimes[i] - releaseTimes[i - 1]', py: 'duration = releaseTimes[i]' },
  { text: 'if (duration > bestDuration || (duration === bestDuration && keysPressed[i] > best)) {', py: 'if duration > best_duration' },
  { text: 'best = keysPressed[i]', py: 'best = keysPressed[i]' },
  { text: 'bestDuration = duration', py: 'best_duration = duration' },
  { text: '}', py: null },
  { text: '}', py: null },
  { text: 'return best', py: 'return best' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def slowestKey(releaseTimes, keysPressed):
    best = keysPressed[0]
    best_duration = releaseTimes[0]
    for i in range(1, len(keysPressed)):
        duration = releaseTimes[i] - releaseTimes[i - 1]
        if duration > best_duration or (duration == best_duration and keysPressed[i] > best):
            best = keysPressed[i]
            best_duration = duration
    return best
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return best')]))

export const phases = [
  { id: 'start', label: 'First press', description: 'The first key is held from time 0 to its release time.' },
  { id: 'compare', label: 'Compare', description: 'Each later press lasts from the previous release to its own release.' },
  { id: 'update', label: 'New slowest', description: 'A longer press, or an equal one with a larger key, becomes the slowest.' },
  { id: 'done', label: 'Result', description: 'The key of the longest press; ties go to the larger key.' },
]

export const examples = [
  { label: 'Longest press wins', input: '{"releaseTimes":[3,8,9],"keysPressed":"pqr"}' },
  { label: 'Tie goes to larger key', input: '{"releaseTimes":[2,4,5],"keysPressed":"mxm"}' },
  { label: 'Single press', input: '{"releaseTimes":[6],"keysPressed":"z"}' },
]

export const complexity = 'O(n) time and O(1) extra space for n key presses.'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object') throw new Error('Use an object with releaseTimes and keysPressed.')
  const { releaseTimes, keysPressed } = input
  if (!Array.isArray(releaseTimes) || typeof keysPressed !== 'string') throw new Error('releaseTimes is an array and keysPressed is a string.')
  if (releaseTimes.length !== keysPressed.length || releaseTimes.length < 1 || releaseTimes.length > 30) throw new Error('Use 1 to 30 presses (visual cap), one key per release time.')
  if (!/^[a-z]+$/.test(keysPressed)) throw new Error('keysPressed uses lowercase letters only.')
  releaseTimes.forEach((t, i) => {
    if (!Number.isInteger(t) || t < 1 || t > 1000) throw new Error('Release times are integers from 1 to 1000.')
    if (i > 0 && t <= releaseTimes[i - 1]) throw new Error('Release times strictly increase.')
  })
  return { releaseTimes, keysPressed }
}

export function buildTrace({ releaseTimes, keysPressed }) {
  const frames = []
  const durations = releaseTimes.map((t, i) => (i === 0 ? t : t - releaseTimes[i - 1]))
  let best = keysPressed[0]
  let bestDuration = durations[0]
  const snap = extra => ({ best, bestDuration, durations: [...durations], ...extra })
  frames.push({ phase: 'start', activeLine: 1, index: 0, message: `Key ${keysPressed[0]} lasts ${durations[0]}; it is the slowest so far.`, snapshot: snap({}) })
  for (let i = 1; i < keysPressed.length; i++) {
    const duration = durations[i]
    frames.push({ phase: 'compare', activeLine: 4, index: i, message: `Key ${keysPressed[i]} lasts ${duration}; the slowest so far lasts ${bestDuration}.`, snapshot: snap({ duration }) })
    if (duration > bestDuration || (duration === bestDuration && keysPressed[i] > best)) {
      best = keysPressed[i]
      bestDuration = duration
      frames.push({ phase: 'update', activeLine: 6, index: i, message: `${keysPressed[i]} becomes the slowest with ${duration}.`, snapshot: snap({ duration }) })
    }
  }
  frames.push({ phase: 'done', activeLine: 10, index: -1, result: best, message: `Slowest key is ${best}.`, snapshot: snap({ result: best }) })
  return { input: { releaseTimes, keysPressed }, result: best, durations, frames }
}
