const MAX_ROWS = 30

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with weather.')
  const { weather } = input
  if (!Array.isArray(weather) || weather.length < 1 || weather.length > MAX_ROWS) throw new Error(`weather has 1 to ${MAX_ROWS} rows.`)
  const seen = new Set()
  const rows = weather.map(row => {
    if (!row || typeof row !== 'object') throw new Error('Each row needs city, month and temperature.')
    const { city, month, temperature } = row
    if (typeof city !== 'string' || !city || typeof month !== 'string' || !month) throw new Error('city and month are non-empty strings.')
    if (!Number.isInteger(temperature)) throw new Error('temperature is an integer.')
    const pair = JSON.stringify([month, city])
    if (seen.has(pair)) throw new Error(`${city} has two rows for ${month}; a pivot needs one value per month and city.`)
    seen.add(pair)
    return { city, month, temperature }
  })
  return { weather: rows }
}

// Code-point order, the same order pandas uses for strings.
const distinctSorted = values => [...new Set(values)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

export function buildTrace({ weather }) {
  const frames = []
  let months = []
  let cities = []
  let grid = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine: L(activeLine), pythonLine: P(pythonLine), message,
    months, cities, grid: grid.map(row => row.slice()), rowIndex: -1, target: null, placed: false, ...extra,
  })

  months = distinctSorted(weather.map(row => row.month))
  push('months', 'collect the distinct months', "months = sorted", `${months.length} distinct month${months.length === 1 ? '' : 's'} become row labels, in text order: ${months.join(', ')}.`)
  cities = distinctSorted(weather.map(row => row.city))
  push('cities', 'collect the distinct cities', "cities = sorted", `${cities.length} distinct cit${cities.length === 1 ? 'y' : 'ies'} become column labels, in text order: ${cities.join(', ')}.`)
  grid = months.map(() => cities.map(() => null))
  push('grid', 'create an empty table', 'table = pd.DataFrame', `An empty ${months.length} by ${cities.length} table is ready. Every cell is blank until a row fills it.`)

  weather.forEach((row, rowIndex) => {
    const target = [months.indexOf(row.month), cities.indexOf(row.city)]
    push('read', 'for each input row', 'for row in', `Row ${rowIndex}: its month picks table row "${row.month}" and its city picks column "${row.city}".`, { rowIndex, target })
    grid[target[0]][target[1]] = row.temperature
    push('place', 'write its temperature', 'table.loc[', `${row.temperature} goes where "${row.month}" meets "${row.city}".`, { rowIndex, target, placed: true })
  })

  const missing = grid.flat().filter(value => value === null).length
  const rows = months.map((month, r) => [month, ...grid[r]])
  push('done', 'return the table', 'return table', missing
    ? `Every row is placed. ${missing} month and city pair${missing === 1 ? ' has' : 's have'} no input row, so ${missing === 1 ? 'that cell stays' : 'those cells stay'} missing (NaN in pandas).`
    : 'Every row is placed and every cell is filled: same data, now one row per month.')
  return { input: { weather }, result: { columns: ['month', ...cities], rows }, frames }
}

export const phases = [
  { id: 'months', label: 'Months', description: 'Distinct months become the sorted row labels.' },
  { id: 'cities', label: 'Cities', description: 'Distinct cities become the sorted column labels.' },
  { id: 'grid', label: 'Grid', description: 'Create the empty table.' },
  { id: 'read', label: 'Read', description: 'One input row chooses a table row and a column.' },
  { id: 'place', label: 'Place', description: 'The temperature lands in the chosen cell.' },
  { id: 'done', label: 'Result', description: 'Return the reshaped table.' },
]

export const code = `reshape long rows into a month by city table
  collect the distinct months and sort them as row labels
  collect the distinct cities and sort them as column labels
  create an empty table with those labels
  for each input row
    write its temperature at its month row and city column
  return the table`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `import pandas as pd

def pivotTable(weather: pd.DataFrame) -> pd.DataFrame:
    months = sorted(weather['month'].unique())
    cities = sorted(weather['city'].unique())
    table = pd.DataFrame(index=pd.Index(months, name='month'), columns=pd.Index(cities, name='city'), dtype=object)
    for row in weather.itertuples():
        table.loc[row.month, row.city] = row.temperature
    return table.infer_objects()
`

const pythonLines = python.split('\n')
const P = s => {
  const index = pythonLines.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
