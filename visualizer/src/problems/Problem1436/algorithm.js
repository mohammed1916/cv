export const phases = [
  { id: 'collect', label: 'Collect departures', description: 'Record every city that has a road leaving it.' },
  { id: 'search', label: 'Find the dead end', description: 'Look for a road whose end city never departs.' },
  { id: 'answer', label: 'Answer', description: 'The city with no road leaving it is the destination.' },
]

const PYTHON = `def destination_city(paths):
    outgoing = set()
    for a, b in paths:
        outgoing.add(a)
    for a, b in paths:
        if b not in outgoing:
            return b
    return None`

export const python = PYTHON
export const code = PYTHON.split('\n').map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))
const lineAt = marker => code.find(({ text }) => text.includes(marker)).line

export function parseInput(text) {
  const paths = JSON.parse(text)
  if (!Array.isArray(paths) || paths.length < 1 || paths.length > 20) throw new Error('Enter a JSON array of 1–20 [from, to] city pairs.')
  paths.forEach((pair, i) => {
    if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string') {
      throw new Error(`Road ${i + 1} must be a pair of city names, like ["Lima", "Oslo"].`)
    }
  })
  const departing = new Set(paths.map(([from]) => from))
  const endpoints = [...new Set(paths.map(([, to]) => to))].filter(city => !departing.has(city))
  if (endpoints.length !== 1) throw new Error('The itinerary needs exactly one city with no road leaving it.')
  return paths
}

/** Traces the two passes: first mark every departing city, then find the arrival city that is never marked. */
export function buildTrace(paths) {
  const frames = []
  const outgoing = new Set()
  const snap = (checking, answer) => ({ roads: paths, outgoing: [...outgoing], checking, answer })

  frames.push({
    phase: 'collect', activeLine: lineAt('outgoing = set()'),
    message: 'Start with an empty set of cities that have a road leaving them.',
    snapshot: snap(null, null),
  })
  paths.forEach(([from], i) => {
    outgoing.add(from)
    frames.push({
      phase: 'collect', activeLine: lineAt('outgoing.add(a)'),
      message: `Road ${i + 1} leaves ${from}, so ${from} is marked as departing.`,
      snapshot: snap(i, null),
    })
  })

  let answer = null
  for (let i = 0; i < paths.length && answer === null; i++) {
    const to = paths[i][1]
    const departs = outgoing.has(to)
    frames.push({
      phase: 'search', activeLine: lineAt('if b not in outgoing'),
      message: departs
        ? `Road ${i + 1} arrives at ${to}, which is marked as departing. Keep looking.`
        : `Road ${i + 1} arrives at ${to}, which is never marked. That is the destination.`,
      snapshot: snap(i, departs ? null : to),
    })
    if (!departs) answer = to
  }

  frames.push({
    phase: 'answer', activeLine: lineAt('return b'),
    message: `The destination is ${answer}.`,
    snapshot: snap(null, answer),
  })
  return { input: paths, result: answer, frames }
}
