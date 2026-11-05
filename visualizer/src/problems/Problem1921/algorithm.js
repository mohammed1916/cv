// LeetCode 1921: monster i arrives at minute ceil(dist / speed). You fire once per minute from minute 0, so the i-th shot (minute i) must come before the i-th arrival.
const SOURCE = [
  "function eliminateMaximum(dist, speed) {",
  "  const arrive = dist.map((d, i) => Math.ceil(d / speed[i])).sort((a, b) => a - b)",
  "  for (let i = 0; i < arrive.length; i++) {",
  "    if (arrive[i] <= i) return i",
  "  }",
  "  return arrive.length",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `from math import ceil

def eliminate_maximum(dist, speed):
    arrive = sorted(ceil(d / s) for d, s in zip(dist, speed))
    for i in range(len(arrive)):
        if arrive[i] <= i:
            return i
    return len(arrive)
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'arrive', label: 'Arrival times', description: 'Each monster reaches the city at ceil(distance / speed).' },
  { id: 'shoot', label: 'Race', description: 'Compare the i-th arrival with the i-th shot.' },
  { id: 'done', label: 'Result', description: 'Monsters eliminated before the first loss.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"dist":[1,3,4],"speed":[1,1,1]}.') }
  const { dist, speed } = input || {}
  if (!Array.isArray(dist) || !Array.isArray(speed) || dist.length !== speed.length || dist.length < 1 || dist.length > 8) throw new Error('dist and speed have the same length from 1 to 8.')
  if (![...dist, ...speed].every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Values are integers from 1 to 100.')
  return { dist, speed }
}

export function buildTrace({ dist, speed }) {
  const frames = []
  const arrive = dist.map((d, i) => ({ id: i, t: Math.ceil(d / speed[i]) }))
  frames.push({ phase: 'arrive', activeLine: L('const arrive ='), pythonLine: P('arrive = sorted'), message: `Arrival minutes: ${arrive.map(a => a.t).join(', ')}.`, sorted: [], i: -1, lost: false, result: null })
  arrive.sort((a, b) => a.t - b.t)
  const times = arrive.map(a => a.t)
  frames.push({ phase: 'arrive', activeLine: L('sort((a, b) => a - b)'), pythonLine: P('arrive = sorted'), message: `Sorted arrivals: ${times.join(', ')}.`, sorted: times, i: -1, lost: false, result: null })
  let result = times.length
  for (let i = 0; i < times.length; i++) {
    const bad = times[i] <= i
    frames.push({ phase: 'shoot', activeLine: L(bad ? 'return i' : 'arrive[i] <= i'), pythonLine: P('arrive[i] <= i'), message: bad ? `Arrival ${times[i]} is not after shot ${i}: the city falls after ${i} eliminations.` : `Arrival ${times[i]} is after shot ${i}: this monster is eliminated in time.`, sorted: times, i, lost: bad, result: null })
    if (bad) { result = i; break }
  }
  frames.push({ phase: 'done', activeLine: L('return'), pythonLine: P('return'), message: `${result} monster(s) eliminated before losing.`, sorted: times, i: -1, lost: false, result })
  return { input: { dist, speed }, result, frames }
}
