const BULBS = 100

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with bulbs.')
  const { bulbs } = input
  if (!Array.isArray(bulbs) || bulbs.length < 1 || bulbs.length > 20) throw new Error('bulbs has 1 to 20 entries.')
  for (const bulb of bulbs) {
    if (!Number.isInteger(bulb) || bulb < 1 || bulb > BULBS) throw new Error('Each entry is an integer from 1 to 100.')
  }
  return { bulbs }
}

export function buildTrace({ bulbs }) {
  const state = Array(BULBS + 1).fill(false)
  const counts = Array(BULBS + 1).fill(0)
  const litBulbs = () => Array.from({ length: BULBS }, (_, k) => k + 1).filter(b => state[b])
  const frames = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('set every bulb'), at: -1, bulb: null, before: null, on: null, count: 0, lit: [], message: 'All 100 bulbs start off.' })
  bulbs.forEach((bulb, i) => {
    const before = state[bulb]
    state[bulb] = !state[bulb]
    counts[bulb] += 1
    frames.push({ pythonLine: 4, phase: 'toggle', activeLine: L('flip the state'), at: i, bulb, before, on: state[bulb], count: counts[bulb], lit: litBulbs(), message: `Toggle bulb ${bulb}: ${before ? 'on' : 'off'} to ${state[bulb] ? 'on' : 'off'}.` })
  })
  const result = litBulbs()
  frames.push({ pythonLine: 5, phase: 'done', activeLine: L('return the bulbs'), at: -1, bulb: null, before: null, on: null, count: 0, lit: result, message: result.length ? `Bulbs on: ${result.join(', ')}.` : 'No bulb is on.' })
  return { input: { bulbs }, result, frames }
}

export const code = `bulbs 1 to 100 start off and entries flip bulbs
  set every bulb to off
  for each entry bulb in the list
    flip the state of that bulb
  return the bulbs that are on, in increasing order`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Throws when the pseudocode text is missing, so a frame can never point at line 0.
function L(s) {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def toggle_light_bulbs(bulbs):
    state = [False] * 101
    for bulb in bulbs:
        state[bulb] = not state[bulb]
    return [b for b in range(1, 101) if state[b]]
`
