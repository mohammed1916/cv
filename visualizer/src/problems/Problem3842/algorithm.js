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
  const litBulbs = () => Array.from({ length: BULBS }, (_, k) => k + 1).filter(b => state[b])
  const frames = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('set every bulb'), at: -1, bulb: null, on: null, lit: [], message: 'All 100 bulbs start off.' })
  bulbs.forEach((bulb, i) => {
    state[bulb] = !state[bulb]
    frames.push({ pythonLine: 4, phase: 'toggle', activeLine: L('flip the state'), at: i, bulb, on: state[bulb], lit: litBulbs(), message: `Toggle bulb ${bulb}: now ${state[bulb] ? 'on' : 'off'}.` })
  })
  const result = litBulbs()
  frames.push({ pythonLine: 5, phase: 'done', activeLine: L('return the bulbs'), at: -1, bulb: null, on: null, lit: result, message: result.length ? `Bulbs on: ${result.join(', ')}.` : 'No bulb is on.' })
  return { input: { bulbs }, result, frames }
}

export const code = `bulbs 1 to 100 start off and entries flip bulbs
  set every bulb to off
  for each entry bulb in the list
    flip the state of that bulb
  return the bulbs that are on, in increasing order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def toggle_light_bulbs(bulbs):
    state = [False] * 101
    for bulb in bulbs:
        state[bulb] = not state[bulb]
    return [b for b in range(1, 101) if state[b]]
`
