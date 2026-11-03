export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with period, green and arrivals.')
  const { period, green, arrivals } = input
  if (!Number.isInteger(period) || period < 2 || period > 1000) throw new Error('period is an integer from 2 to 1000.')
  if (!Array.isArray(green) || green.length < 1 || green.length > 6) throw new Error('green lists 1 to 6 lights.')
  if (!green.every(g => Number.isInteger(g) && g >= 1 && g < period)) throw new Error('Each green time is an integer from 1 to period minus 1.')
  if (!Array.isArray(arrivals) || arrivals.length < 1 || arrivals.length > 12) throw new Error('arrivals lists 1 to 12 car times.')
  if (!arrivals.every(t => Number.isInteger(t) && t >= 1 && t <= 1000000000)) throw new Error('Each arrival is an integer from 1 to 1000000000.')
  return { period, green, arrivals }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

export function buildTrace({ period, green, arrivals }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)
  const longest = Math.max(...green)
  let worst = 0
  frames.push({ phase: 'start', activeLine: L('longest = the largest green'), pythonLine: P('longest = max(green)'), period, green, longest, arrival: -1, r: null, light: null, wait: null, worst, result: null, message: `Each light is green for the first part of a ${period}-unit cycle. The longest green is ${longest}.` })
  arrivals.forEach((time, i) => {
    const r = time % period
    const wait = r < longest ? 0 : period - r
    const light = r < longest ? green.findIndex(g => g > r) : -1
    worst = Math.max(worst, wait)
    frames.push({ phase: wait === 0 ? 'green' : 'red', activeLine: L('if r is less than the longest'), pythonLine: P('if r < longest'), period, green, longest, arrival: i, time, r, light, wait, worst, result: null, message: wait === 0 ? `Car ${i + 1} arrives at remainder ${r}, while light ${light} is green: waits 0.` : `Car ${i + 1} arrives at remainder ${r}, after every green ends: waits ${wait}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return worst'), pythonLine: P('return worst'), period, green, longest, arrival: -1, r: null, light: null, wait: null, worst, result: worst, message: `The largest waiting time, minimised over the light choices, is ${worst}.` })
  return { input: { period, green, arrivals }, result: worst, frames }
}

export const code = `smallest possible largest waiting time
longest = the largest green time
worst = 0
for each car arrival time
  r = arrival modulo period
  if r is less than the longest green then the car waits 0 at a green light
  else the car waits period minus r
  worst = max(worst, wait)
return worst`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_max_wait(period, green, arrivals):
    longest = max(green)
    worst = 0
    for time in arrivals:
        r = time % period
        if r < longest:
            wait = 0
        else:
            wait = period - r
        worst = max(worst, wait)
    return worst
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
