export const phases = [
  { id: 'measure', label: 'Measure presses', description: 'Each press lasts from the previous release until its own release. The first press starts at time 0.' },
  { id: 'compare', label: 'Keep the best', description: 'A longer press replaces the best. On a tie, the lexicographically larger key wins.' },
  { id: 'answer', label: 'Slowest key', description: 'After every press has been measured, the best key is the answer.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.releaseTimes) || typeof data.keysPressed !== 'string') throw new Error('Use {"releaseTimes":[...],"keysPressed":"..."}.')
  const n = data.releaseTimes.length
  if (n < 1 || n > 20) throw new Error('Use 1 to 20 presses.')
  if (data.keysPressed.length !== n) throw new Error('keysPressed must have one letter per release time.')
  if (!data.releaseTimes.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each release time must be an integer from 1 to 1000.')
  if (data.releaseTimes.some((v, i) => i > 0 && v <= data.releaseTimes[i - 1])) throw new Error('Release times must strictly increase.')
  if (!/^[a-z]+$/.test(data.keysPressed)) throw new Error('keysPressed may contain only lowercase letters.')
  return { releaseTimes: [...data.releaseTimes], keysPressed: data.keysPressed }
}

const CODE = `slowest key (releaseTimes, keysPressed):
  previous = 0
  bestKey = ''
  bestTime = -1
  for each press i:
    duration = releaseTimes[i] - previous
    previous = releaseTimes[i]
    if duration > bestTime or (duration == bestTime and keysPressed[i] > bestKey):
      bestTime = duration
      bestKey = keysPressed[i]
  return bestKey`.split('\n')
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = { start: 2, measure: 6, compare: 8, update: 9, answer: 11 }

export const python = `def slowest_key(release_times, keys_pressed):
    previous = 0
    best_key, best_time = '', -1
    for release, key in zip(release_times, keys_pressed):
        duration = release - previous
        previous = release
        if duration > best_time or (duration == best_time and key > best_key):
            best_time, best_key = duration, key
    return best_key`
const PYLINE = { start: 2, measure: 6, compare: 8, update: 9, answer: 10 }

export function buildTrace(input) {
  const { releaseTimes, keysPressed } = input
  const frames = []
  const durations = []
  let previous = 0
  let bestKey = ''
  let bestTime = -1
  const snap = (index, duration) => ({ index, duration, durations: [...durations], bestKey, bestTime })
  frames.push({ phase: 'measure', activeLine: L.start, pythonLine: PYLINE.start, message: `Start with the previous release at time 0. The best key is not chosen yet.`, ...snap(-1, null) })
  for (let i = 0; i < releaseTimes.length; i++) {
    const key = keysPressed[i]
    const duration = releaseTimes[i] - previous
    previous = releaseTimes[i]
    durations.push(duration)
    frames.push({ phase: 'measure', activeLine: L.measure, pythonLine: PYLINE.measure, message: `Press ${i + 1} (key ${key}) lasts ${duration}: released at ${releaseTimes[i]}, ${previous - duration} before it.`, ...snap(i, duration) })
    const replaces = duration > bestTime || (duration === bestTime && key > bestKey)
    if (replaces) { bestTime = duration; bestKey = key }
    frames.push({ phase: 'compare', activeLine: replaces ? L.update : L.compare, pythonLine: replaces ? PYLINE.update : PYLINE.compare,
      message: replaces ? `Key ${key} is the new best with duration ${duration}.` : `Key ${key} lasts ${duration}. ${duration === bestTime ? `It ties with ${bestKey}, which is not smaller, so ${bestKey} stays.` : `That is shorter than the best ${bestTime}, so it stays out.`}`, ...snap(i, duration) })
  }
  frames.push({ phase: 'answer', activeLine: L.answer, pythonLine: PYLINE.answer, message: `The slowest key is ${bestKey}, held for ${bestTime}.`, ...snap(releaseTimes.length - 1, null) })
  return { input, result: bestKey, frames }
}
