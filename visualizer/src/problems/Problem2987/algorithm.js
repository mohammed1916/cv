// SQL walkthrough with invented sample tables.
export const sql = `SELECT city
FROM Listings
GROUP BY city
HAVING AVG(price) > (SELECT AVG(price) FROM Listings)
ORDER BY city`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def expensive_cities(listings):
    overall = listings["price"].mean()
    averages = listings.groupby("city")["price"].mean()
    keep = averages[averages > overall]
    return keep.reset_index()[["city"]].sort_values("city")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read every listing.' },
  { id: 'overall', label: 'Overall', description: 'Average all listing prices, one row per listing.' },
  { id: 'city', label: 'Cities', description: 'Average each city and compare it with the overall figure.' },
  { id: 'done', label: 'Result', description: 'Report the cities above the overall average.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 20) throw new Error(`${name} needs 1 to 20 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    return Object.fromEntries(columns.map(column => [column, row[column]]))
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Listings table.')
  return { Listings: tableRows(input, 'Listings', ['listing_id', 'city', 'price']) }
}

export function buildTrace(input) {
  const rows = input.Listings
  const frames = []
  frames.push(frame('load', 'FROM Listings', 'def expensive', 'Read every listing.', ['listing_id', 'city', 'price'], rows))

  const total = rows.reduce((sum, row) => sum + row.price, 0)
  const overall = total / rows.length
  frames.push(frame('overall', 'SELECT AVG(price) FROM Listings)', 'overall = ', `Every listing counts once: ${total} / ${rows.length} = ${overall}.`, ['overall_average'], [{ overall_average: overall }]))

  const byCity = new Map()
  for (const row of rows) {
    if (!byCity.has(row.city)) byCity.set(row.city, [])
    byCity.get(row.city).push(row.price)
  }
  const summary = []
  const result = []
  for (const city of [...byCity.keys()].sort()) {
    const prices = byCity.get(city)
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const kept = average > overall
    summary.push({ city, city_average: average, kept: kept ? 'yes' : 'no' })
    if (kept) result.push({ city })
    frames.push(frame('city', 'GROUP BY city', 'averages = ', `${city} averages ${average}, ${kept ? 'above' : 'not above'} ${overall}, so it ${kept ? 'stays' : 'is dropped'}.`, ['city', 'city_average', 'kept'], summary))
  }
  frames.push(frame('done', 'ORDER BY city', 'return', `Return ${result.length} cit${result.length === 1 ? 'y' : 'ies'}.`, ['city'], result))
  return { input, result, frames }
}
