// Knowledge-derived teaching model written for this visualizer. Not the official statement text.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the city table.' },
  { id: 'group', label: 'Group', description: 'Collect the cities of one state.' },
  { id: 'qualify', label: 'Qualify', description: 'The state has at least three cities.' },
  { id: 'list', label: 'List', description: 'Join the state\'s city names in sorted order.' },
  { id: 'skip', label: 'Skip', description: 'The state has fewer than three cities and is dropped.' },
  { id: 'output', label: 'Result', description: 'Return one row per qualifying state.' },
]

export const code = `SELECT state, GROUP_CONCAT(city ORDER BY city SEPARATOR ', ') AS cities
FROM Cities
GROUP BY state
HAVING COUNT(*) >= 3
ORDER BY state`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def cities_per_state(cities):
    counts = cities.groupby('state').size()
    keep = counts[counts >= 3].index
    kept = cities[cities.state.isin(keep)]
    out = kept.groupby('state')['city'].agg(lambda s: ', '.join(sorted(s)))
    return out.reset_index(name='cities').sort_values('state')
`

const lookupCode = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`No SQL line contains: ${text}`)
  return index + 1
}
const lookupPython = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Cities)) throw new Error('Use an object with a Cities list.')
  if (input.Cities.length > 12) throw new Error('Use at most 12 cities so each step stays readable.')
  const seen = new Set()
  for (const c of input.Cities) {
    if (typeof c.state !== 'string' || !/^[A-Z]{2}$/.test(c.state)) throw new Error('state is a two-letter uppercase code.')
    if (typeof c.city !== 'string' || c.city.length < 1 || c.city.length > 20) throw new Error('city is 1 to 20 characters.')
    const key = `${c.state}|${c.city}`
    if (seen.has(key)) throw new Error('Each state and city pair appears once.')
    seen.add(key)
  }
  return input
}

export function buildTrace(input) {
  const byState = new Map()
  for (const c of input.Cities) byState.set(c.state, [...(byState.get(c.state) || []), c.city])
  const states = [...byState.keys()].sort()
  const out = []
  const rows = () => out.map(r => ({ ...r }))
  const frames = []
  const push = (phase, sqlText, pyText, message) => frames.push({
    phase, activeLine: lookupCode(sqlText), pythonLine: lookupPython(pyText), message, rows: rows(),
  })
  push('load', 'FROM Cities', 'counts = ', `Load ${input.Cities.length} cities across ${states.length} states.`)
  for (const state of states) {
    const cities = [...byState.get(state)].sort()
    push('group', 'GROUP BY state', "groupby('state')", `Collect the ${cities.length} cities of ${state}.`)
    if (cities.length < 3) {
      push('skip', 'HAVING COUNT', 'isin(keep)', `${state} has ${cities.length} cit${cities.length === 1 ? 'y' : 'ies'}, so it is dropped.`)
      continue
    }
    push('qualify', 'HAVING COUNT', 'counts >= 3', `${state} has at least three cities.`)
    out.push({ state, cities: cities.join(', ') })
    push('list', 'GROUP_CONCAT', "join(sorted", `Join the sorted names for ${state}.`)
  }
  const result = rows()
  push('output', 'ORDER BY state', 'return out', `Return ${result.length} qualifying state row${result.length === 1 ? '' : 's'}.`)
  return { input, result, frames }
}
