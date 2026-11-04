// Teaching model written for this visualizer. Each state's cities are listed alphabetically.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the city table.' },
  { id: 'group', label: 'Group', description: 'Collect and sort the cities of one state.' },
  { id: 'count', label: 'Count', description: 'Count the cities that start with the same letter as the state.' },
  { id: 'skip', label: 'Drop', description: 'The state fails a rule, so it does not appear in the result.' },
  { id: 'keep', label: 'Keep', description: 'The state passes both rules and joins the result.' },
  { id: 'output', label: 'Result', description: 'Order by the matching count, highest first, then by state name.' },
]

export const code = `SELECT state,
  GROUP_CONCAT(city ORDER BY city SEPARATOR ', ') AS cities,
  SUM(LEFT(city, 1) = LEFT(state, 1)) AS matching_letter_count
FROM cities
GROUP BY state
HAVING COUNT(city) >= 3 AND matching_letter_count > 0
ORDER BY matching_letter_count DESC, state`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def cities_per_state(cities):
    out = cities.groupby('state').agg(count=('city', 'size')).reset_index()
    out['matching'] = [sum(c[0] == st[0] for c in cities[cities.state == st].city) for st in out.state]
    out = out[(out['count'] >= 3) & (out['matching'] > 0)]
    out['cities'] = [', '.join(sorted(cities[cities.state == st].city)) for st in out.state]
    return out.sort_values(['matching', 'state'], ascending=[False, True])
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
  if (input.Cities.length > 14) throw new Error('Use at most 14 cities so each step stays readable.')
  const seen = new Set()
  for (const c of input.Cities) {
    if (typeof c.state !== 'string' || !/^[A-Za-z][A-Za-z ]{0,19}$/.test(c.state)) throw new Error('state is a name of 1 to 20 letters or spaces.')
    if (typeof c.city !== 'string' || !/^[A-Za-z][A-Za-z ]{0,19}$/.test(c.city)) throw new Error('city is a name of 1 to 20 letters or spaces.')
    const key = `${c.state}|${c.city}`
    if (seen.has(key)) throw new Error('Each state and city pair appears once.')
    seen.add(key)
  }
  return input
}

export function buildTrace(input) {
  const byState = new Map()
  for (const c of input.Cities) {
    if (!byState.has(c.state)) byState.set(c.state, [])
    byState.get(c.state).push(c.city)
  }
  const states = [...byState.keys()].sort()
  const info = new Map()
  const frames = []
  const snapshot = () => states.filter(s => info.has(s)).map(s => ({ ...info.get(s) }))
  const push = (phase, sqlText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: lookupCode(sqlText), pythonLine: lookupPython(pyText), message, rows: [], groups: snapshot(), ...extra,
  })
  push('load', 'FROM cities', 'out = cities.groupby', `Load ${input.Cities.length} cities across ${states.length} states.`)
  const kept = []
  for (const state of states) {
    const cities = [...byState.get(state)].sort()
    const matching = cities.filter(city => city[0].toUpperCase() === state[0].toUpperCase()).length
    info.set(state, { state, cities: cities.join(', '), count: cities.length, matching, matchingCities: cities.filter(city => city[0].toUpperCase() === state[0].toUpperCase()) })
    push('group', 'GROUP BY state', 'out = cities.groupby', `${state}: ${cities.length} cities, sorted: ${cities.join(', ')}.`, { current: state })
    if (cities.length < 3) {
      push('skip', 'HAVING COUNT(city) >= 3', 'out = out[(out', `${state} has ${cities.length} cities, fewer than 3, so it is dropped.`, { current: state })
      continue
    }
    push('count', 'SUM(LEFT(city, 1)', "out['matching'] =", `${state} has ${matching} city name(s) starting with ${state[0].toUpperCase()}.`, { current: state })
    if (matching === 0) {
      push('skip', 'matching_letter_count > 0', 'out = out[(out', `No city in ${state} starts with ${state[0].toUpperCase()}, so ${state} is dropped.`, { current: state })
      continue
    }
    kept.push({ state, cities: cities.join(', '), matching_letter_count: matching })
    push('keep', 'matching_letter_count > 0', 'out = out[(out', `${state} passes both rules and joins the result.`, { current: state })
  }
  const result = kept.slice().sort((a, b) => b.matching_letter_count - a.matching_letter_count || a.state.localeCompare(b.state))
  push('output', 'ORDER BY matching_letter_count DESC', 'return out', `Return ${result.length} state row${result.length === 1 ? '' : 's'}.`, { rows: result.map(r => ({ ...r })) })
  return { input, result, frames }
}
