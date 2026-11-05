export const phases = [
  { id: 'start', label: 'Events', description: 'Each lamp adds +1 where its light starts and -1 just after it ends.' },
  { id: 'sweep', label: 'Sweep', description: 'Walk the event positions from left to right, keeping the brightness that holds until the next event.' },
  { id: 'best', label: 'New brightest', description: 'A strictly higher brightness moves the answer to this event position; ties keep the leftmost.' },
  { id: 'done', label: 'Result', description: 'Return the leftmost brightest position.' },
]

export const code = `function brightestPosition(lights) {
  const change = new Map()
  for (const [position, range] of lights) {
    change.set(position - range, (change.get(position - range) ?? 0) + 1)
    change.set(position + range + 1, (change.get(position + range + 1) ?? 0) - 1)
  }
  let brightness = 0
  let best = 0
  let answer = 0
  for (const point of [...change.keys()].sort((a, b) => a - b)) {
    brightness += change.get(point)
    if (brightness > best) {
      best = brightness
      answer = point
    }
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def brightest_position(lights):
    change = {}
    for position, rng in lights:
        change[position - rng] = change.get(position - rng, 0) + 1
        change[position + rng + 1] = change.get(position + rng + 1, 0) - 1
    brightness = 0
    best = 0
    answer = 0
    for point in sorted(change):
        brightness += change[point]
        if brightness > best:
            best = brightness
            answer = point
    return answer
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let lights
  try { lights = JSON.parse(text) } catch { throw new Error('Use a JSON array of [position, range] pairs.') }
  if (!Array.isArray(lights) || lights.length < 1 || lights.length > 20) throw new Error('Give 1 to 20 lamps here.')
  if (!lights.every(l => Array.isArray(l) && l.length === 2 && Number.isInteger(l[0]) && Number.isInteger(l[1]) && Math.abs(l[0]) <= 50 && l[1] >= 0 && l[1] <= 50)) {
    throw new Error('Each lamp is [position, range] with whole numbers; positions from -50 to 50 and ranges from 0 to 50.')
  }
  return lights
}

export function buildTrace(lights) {
  const frames = []
  const change = new Map()
  for (const [position, range] of lights) {
    change.set(position - range, (change.get(position - range) ?? 0) + 1)
    change.set(position + range + 1, (change.get(position + range + 1) ?? 0) - 1)
  }
  const points = [...change.keys()].sort((a, b) => a - b)
  let brightness = 0
  let best = 0
  let answer = 0
  const add = (phase, c, p, message, point, level) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { lights, points, point, brightness: level, best, answer, change: [...change.entries()] },
  })
  add('start', 'const change = new Map', 'change = {}', `${points.length} event positions to sweep.`, null, 0)
  for (const point of points) {
    brightness += change.get(point)
    add('sweep', 'brightness += change.get', 'brightness += change[point]', `At position ${point} the brightness becomes ${brightness}.`, point, brightness)
    if (brightness > best) {
      best = brightness
      answer = point
      add('best', 'best = brightness', 'best = brightness', `New brightest: ${brightness} lamps from position ${point}.`, point, brightness)
    }
  }
  add('done', 'return answer', 'return answer', `The leftmost brightest position is ${answer}.`, null, best)
  return { input: lights, result: answer, frames }
}
