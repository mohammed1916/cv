// Knowledge-derived SQL walkthrough. The sample table is invented for this visualization.
export const sql = `SELECT artist, COUNT(*) AS occurrences
FROM SpotifyRanking
GROUP BY artist
ORDER BY occurrences DESC, artist ASC`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def count_artist_occurrences(spotify_ranking):
    counts = {}
    for artist in spotify_ranking.artist:
        counts[artist] = counts.get(artist, 0) + 1
    rows = [{"artist": a, "occurrences": n} for a, n in counts.items()]
    return sorted(rows, key=lambda r: (-r["occurrences"], r["artist"]))`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const COLS = ['id', 'artist', 'track', 'position']
const COUNT_COLS = ['artist', 'occurrences']

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the ranking records.' },
  { id: 'group', label: 'Group', description: 'Count the records for each artist.' },
  { id: 'done', label: 'Result', description: 'Sort by count, then by artist name.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a SpotifyRanking table.')
  const rows = tableRows(input, 'SpotifyRanking', COLS)
  for (const row of rows) {
    if (!Number.isInteger(row.id) || !Number.isInteger(row.position)) throw new Error('id and position are integers.')
    if (typeof row.artist !== 'string' || row.artist.length < 1) throw new Error('artist is a nonempty string.')
  }
  return { SpotifyRanking: rows }
}

export function buildTrace(input) {
  const rows = input.SpotifyRanking
  const frames = [frame('load', 'FROM SpotifyRanking', 'def ', 'Read the ranking records.', COLS, rows)]
  const counts = new Map()
  for (const row of rows) {
    counts.set(row.artist, (counts.get(row.artist) ?? 0) + 1)
    const summary = [...counts.entries()].map(([artist, occurrences]) => ({ artist, occurrences }))
    frames.push(frame('group', 'GROUP BY artist', 'counts[artist] =', `Record ${row.id} adds one to ${row.artist}, now ${counts.get(row.artist)}.`, COUNT_COLS, summary))
  }
  const sorted = [...counts.entries()]
    .map(([artist, occurrences]) => ({ artist, occurrences }))
    .sort((a, b) => b.occurrences - a.occurrences || (a.artist < b.artist ? -1 : a.artist > b.artist ? 1 : 0))
  frames.push(frame('done', 'ORDER BY occurrences', 'return sorted', `Return ${sorted.length} artists in order.`, COUNT_COLS, sorted))
  return { input, result: sorted, frames }
}
