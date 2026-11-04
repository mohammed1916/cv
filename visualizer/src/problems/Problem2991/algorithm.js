const MAX_ROWS = 24

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Wineries table.')
  const { Wineries: table } = input
  if (!Array.isArray(table) || table.length < 1 || table.length > MAX_ROWS) throw new Error(`Wineries has 1 to ${MAX_ROWS} rows in this visualization.`)
  const seen = new Set()
  const rows = table.map(row => {
    if (!row || typeof row !== 'object') throw new Error('Each row has id, country, points and winery.')
    const { id, country, points, winery } = row
    if (!Number.isInteger(id)) throw new Error('Each id is an integer.')
    if (seen.has(id)) throw new Error(`The id ${id} appears twice; id values are unique.`)
    seen.add(id)
    if (typeof country !== 'string' || !country) throw new Error('Each country is a non-empty string.')
    if (typeof winery !== 'string' || !winery) throw new Error('Each winery is a non-empty string.')
    if (!Number.isInteger(points)) throw new Error('Each points value is an integer.')
    return { id, country, points, winery }
  })
  return { Wineries: rows }
}

export const sql = `WITH totals AS (
  SELECT country, winery, SUM(points) AS total
  FROM Wineries
  GROUP BY country, winery
),
ranked AS (
  SELECT country, CONCAT(winery, ' (', total, ')') AS label,
    ROW_NUMBER() OVER (PARTITION BY country ORDER BY total DESC, winery ASC) AS place
  FROM totals
)
SELECT country,
  MAX(CASE WHEN place = 1 THEN label END) AS top_winery,
  COALESCE(MAX(CASE WHEN place = 2 THEN label END), 'No second winery') AS second_winery,
  COALESCE(MAX(CASE WHEN place = 3 THEN label END), 'No third winery') AS third_winery
FROM ranked
GROUP BY country
ORDER BY country`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))

const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`SQL line missing: ${key}`)
  return index + 1
}

export const python = `def top_three_wineries(Wineries):
    totals = {}
    for row in Wineries:
        key = (row["country"], row["winery"])
        totals[key] = totals.get(key, 0) + row["points"]
    by_country = {}
    for (country, winery), total in totals.items():
        by_country.setdefault(country, []).append((-total, winery))
    result = []
    for country in sorted(by_country):
        ranked = sorted(by_country[country])
        labels = [f"{winery} ({-negative})" for negative, winery in ranked]
        result.append({
            "country": country,
            "top_winery": labels[0],
            "second_winery": labels[1] if len(labels) > 1 else "No second winery",
            "third_winery": labels[2] if len(labels) > 2 else "No third winery",
        })
    return result`

const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Python line missing: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the source rows.' },
  { id: 'sum', label: 'Sum', description: 'Add each row to its country and winery total.' },
  { id: 'rank', label: 'Rank', description: 'Sort one country by total, then by name.' },
  { id: 'pivot', label: 'Pivot', description: 'Fill the three columns of one result row.' },
  { id: 'done', label: 'Result', description: 'The finished table, ordered by country.' },
]

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
const SLOTS = [
  { column: 'top_winery', word: 'first', missing: null, codeKey: 'THEN label END) AS top_winery', pyKey: '"top_winery"' },
  { column: 'second_winery', word: 'second', missing: 'No second winery', codeKey: "'No second winery'", pyKey: '"second_winery"' },
  { column: 'third_winery', word: 'third', missing: 'No third winery', codeKey: "'No third winery'", pyKey: '"third_winery"' },
]

export function buildTrace({ Wineries: rows }) {
  const frames = []
  const totals = []
  const boards = []
  const output = []
  const copyRows = list => list.map(row => ({ ...row }))
  const push = (phase, codeKey, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: SQL(codeKey), pythonLine: PY(pyKey), message,
    sourceRow: extra.sourceRow ?? -1, totals: copyRows(totals), totalRow: extra.totalRow ?? -1,
    boards: boards.map(board => ({ ...board, ranked: copyRows(board.ranked) })),
    activeCountry: extra.activeCountry ?? null, activePlace: extra.activePlace ?? null, added: extra.added ?? null,
    output: copyRows(output), outputRow: extra.outputRow ?? -1, activeColumn: extra.activeColumn ?? null,
  })

  push('load', 'FROM Wineries', 'def top_three_wineries', `The source table holds ${rows.length} row${rows.length === 1 ? '' : 's'}. A winery can appear more than once.`)
  rows.forEach((row, index) => {
    let at = totals.findIndex(entry => entry.country === row.country && entry.winery === row.winery)
    const isNew = at < 0
    if (isNew) {
      totals.push({ country: row.country, winery: row.winery, total: 0 })
      at = totals.length - 1
    }
    const before = totals[at].total
    totals[at].total += row.points
    push('sum', 'SUM(points) AS total', 'totals[key] = totals.get', isNew
      ? `${row.winery} in ${row.country} is new, so its total starts at ${row.points}.`
      : `${row.winery} in ${row.country} appears again: ${before} + ${row.points} = ${totals[at].total}.`, { sourceRow: index, totalRow: at, added: row.points })
  })

  const countries = [...new Set(totals.map(entry => entry.country))].sort(compare)
  for (const country of countries) {
    const ranked = totals.filter(entry => entry.country === country)
      .sort((a, b) => b.total - a.total || compare(a.winery, b.winery))
      .map((entry, index) => ({ ...entry, place: index + 1, label: `${entry.winery} (${entry.total})` }))
    boards.push({ country, ranked })
    const tie = ranked.some((entry, index) => index > 0 && entry.total === ranked[index - 1].total)
    push('rank', 'ROW_NUMBER() OVER', 'ranked = sorted', `${country} has ${ranked.length} winer${ranked.length === 1 ? 'y' : 'ies'} after grouping. Highest total first${tie ? ', and tied totals fall back to name order' : ''}.`, { activeCountry: country })
  }
  for (const board of boards) {
    const row = { country: board.country, top_winery: '', second_winery: '', third_winery: '' }
    output.push(row)
    const rowIndex = output.length - 1
    SLOTS.forEach((slot, index) => {
      const entry = board.ranked[index]
      row[slot.column] = entry ? entry.label : slot.missing
      push('pivot', slot.codeKey, slot.pyKey, entry
        ? `${board.country}, place ${index + 1}: ${slot.column} is ${entry.label}.`
        : `${board.country} has no ${slot.word} place, so ${slot.column} gets the fixed phrase "${slot.missing}".`, { activeCountry: board.country, activePlace: index + 1, outputRow: rowIndex, activeColumn: slot.column })
    })
  }
  push('done', 'ORDER BY country', 'return result', `Done: ${output.length} row${output.length === 1 ? '' : 's'}, one per country, in ascending country order.`)
  return { input: { Wineries: rows }, result: copyRows(output), frames }
}
