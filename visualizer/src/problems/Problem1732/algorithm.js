// Highest altitude: the altitude is a running sum of the gains; keep the largest value reached, starting from 0.
const JS_LINES = [
  { text: 'let altitude = 0, highest = 0', py: 'altitude = highest = 0' },
  { text: 'for (const g of gain) {', py: 'for g in gain' },
  { text: 'altitude += g', py: 'altitude += g' },
  { text: 'highest = Math.max(highest, altitude)', py: 'highest = max(' },
  { text: '}', py: null },
  { text: 'return highest', py: 'return highest' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def largestAltitude(gain):
    altitude = highest = 0
    for g in gain:
        altitude += g
        highest = max(highest, altitude)
    return highest
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return highest')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'Start at altitude 0, which also counts as a height reached.' },
  { id: 'climb', label: 'Climb', description: 'Each gain moves the altitude up or down.' },
  { id: 'record', label: 'Record', description: 'Keep the highest altitude reached so far.' },
  { id: 'done', label: 'Result', description: 'The highest altitude over the whole trip.' },
]

export const examples = [
  { label: 'Down then up', input: '[-3,4,-1,2,-5]' },
  { label: 'Only down', input: '[-2,-4]' },
  { label: 'Single gain', input: '[5]' },
  { label: 'Zero gains', input: '[0,0,0]' },
  { label: 'Extreme gains', input: '[100,-100,100,-100]' },
  { label: 'Long run: 40 gains', input: '[82,-25,47,56,41,32,80,-17,21,-84,30,67,8,-13,-6,59,95,28,6,10,-3,-28,-52,-10,-31,-4,-97,-63,-77,-37,-86,39,66,30,-52,66,-61,76,-83,-34]' },
]

export const complexity = 'O(n) time and O(1) extra space for n gains.'

export function parseInput(text) {
  const gain = JSON.parse(text)
  if (!Array.isArray(gain) || gain.length < 1 || gain.length > 40) throw new Error('Use a JSON array of 1 to 40 integers (visual cap).')
  if (!gain.every(g => Number.isInteger(g) && g >= -100 && g <= 100)) throw new Error('Gains are integers from -100 to 100.')
  return gain
}

export function buildTrace(gain) {
  const frames = []
  const altitudes = [0]
  let altitude = 0
  let highest = 0
  const snap = extra => ({ altitudes: [...altitudes], highest, ...extra })
  frames.push({ phase: 'start', activeLine: 1, index: 0, message: 'Altitude 0 at the start.', snapshot: snap({}) })
  gain.forEach((g, i) => {
    altitude += g
    altitudes.push(altitude)
    frames.push({ phase: 'climb', activeLine: 3, index: i + 1, message: `Gain ${g}: altitude ${altitude}.`, snapshot: snap({}) })
    highest = Math.max(highest, altitude)
    frames.push({ phase: 'record', activeLine: 4, index: i + 1, message: `Highest so far ${highest}.`, snapshot: snap({}) })
  })
  frames.push({ phase: 'done', activeLine: 6, index: -1, result: highest, message: `Highest altitude ${highest}.`, snapshot: snap({ result: highest }) })
  return { input: gain, result: highest, frames }
}
