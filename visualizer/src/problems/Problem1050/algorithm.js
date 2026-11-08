// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT actor_id, director_id
FROM ActorDirector
GROUP BY actor_id, director_id
HAVING COUNT(*) >= 3
ORDER BY actor_id, director_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def pairs_three_times(actor_director):
    counts = actor_director.groupby(["actor_id", "director_id"]).size()
    kept = counts[counts >= 3].reset_index()
    return kept[["actor_id", "director_id"]].to_dict("records")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows, extra = {}) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })), ...extra,
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the collaboration records.' },
  { id: 'group', label: 'Group', description: 'Count the records of each pair.' },
  { id: 'done', label: 'Result', description: 'Output pairs with at least three records.' },
]

export const inputLabel = 'Object with an ActorDirector table'
export const complexity = 'O(n) over the collaboration rows. The visualizer caps the table at 12 rows.'
export const examples = [
  {
    label: 'Sample',
    input: '{"ActorDirector":[{"actor_id":4,"director_id":9,"timestamp":10},{"actor_id":4,"director_id":9,"timestamp":11},{"actor_id":4,"director_id":9,"timestamp":12},{"actor_id":4,"director_id":8,"timestamp":13},{"actor_id":6,"director_id":8,"timestamp":14},{"actor_id":6,"director_id":8,"timestamp":15},{"actor_id":6,"director_id":8,"timestamp":16},{"actor_id":6,"director_id":9,"timestamp":17}]}',
  },
  { label: 'Single collaboration', input: '{"ActorDirector":[{"actor_id":1,"director_id":2,"timestamp":1}]}' },
  { label: 'Exactly three collaborations qualify', input: '{"ActorDirector":[{"actor_id":1,"director_id":2,"timestamp":1},{"actor_id":1,"director_id":2,"timestamp":2},{"actor_id":1,"director_id":2,"timestamp":3},{"actor_id":3,"director_id":4,"timestamp":4},{"actor_id":3,"director_id":4,"timestamp":5}]}' },
  { label: 'Largest table: one pair, twelve rows', input: '{"ActorDirector":[{"actor_id":1,"director_id":2,"timestamp":1},{"actor_id":1,"director_id":2,"timestamp":2},{"actor_id":1,"director_id":2,"timestamp":3},{"actor_id":1,"director_id":2,"timestamp":4},{"actor_id":1,"director_id":2,"timestamp":5},{"actor_id":1,"director_id":2,"timestamp":6},{"actor_id":1,"director_id":2,"timestamp":7},{"actor_id":1,"director_id":2,"timestamp":8},{"actor_id":1,"director_id":2,"timestamp":9},{"actor_id":1,"director_id":2,"timestamp":10},{"actor_id":1,"director_id":2,"timestamp":11},{"actor_id":1,"director_id":2,"timestamp":12}]}' },
  { label: 'No pair reaches three', input: '{"ActorDirector":[{"actor_id":1,"director_id":2,"timestamp":1},{"actor_id":1,"director_id":3,"timestamp":2},{"actor_id":2,"director_id":3,"timestamp":3},{"actor_id":4,"director_id":5,"timestamp":4}]}' },
  { label: 'Long run: 12 collaborations', input: '{"ActorDirector":[{"actor_id":3,"director_id":1,"timestamp":1},{"actor_id":2,"director_id":3,"timestamp":2},{"actor_id":3,"director_id":2,"timestamp":3},{"actor_id":1,"director_id":2,"timestamp":4},{"actor_id":1,"director_id":3,"timestamp":5},{"actor_id":3,"director_id":3,"timestamp":6},{"actor_id":1,"director_id":1,"timestamp":7},{"actor_id":3,"director_id":2,"timestamp":8},{"actor_id":1,"director_id":3,"timestamp":9},{"actor_id":2,"director_id":1,"timestamp":10},{"actor_id":1,"director_id":2,"timestamp":11},{"actor_id":1,"director_id":3,"timestamp":12}]}' },
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an ActorDirector table.')
  return { ActorDirector: tableRows(input, 'ActorDirector', ['actor_id', 'director_id', 'timestamp']) }
}

export function buildTrace(input) {
  const { ActorDirector } = input
  const frames = []
  frames.push(frame('load', 'FROM ActorDirector', 'def ', `Load ${ActorDirector.length} collaboration records.`, ['actor_id', 'director_id', 'timestamp'], ActorDirector))

  const counts = new Map()
  for (const row of ActorDirector) {
    const key = `${row.actor_id}|${row.director_id}`
    if (!counts.has(key)) counts.set(key, { actor_id: row.actor_id, director_id: row.director_id, collaborations: 0 })
    counts.get(key).collaborations += 1
  }
  const summary = []
  const result = []
  for (const pair of counts.values()) {
    const ok = pair.collaborations >= 3
    summary.push({ ...pair, kept: ok ? 'yes' : 'no' })
    if (ok) result.push({ actor_id: pair.actor_id, director_id: pair.director_id })
    frames.push(frame('group', 'HAVING', 'counts =', `Pair ${pair.actor_id} and ${pair.director_id} has ${pair.collaborations} record${pair.collaborations === 1 ? '' : 's'}, so it ${ok ? 'stays' : 'is dropped'}.`, ['actor_id', 'director_id', 'collaborations', 'kept'], summary))
  }
  result.sort((a, b) => a.actor_id - b.actor_id || a.director_id - b.director_id)
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} pair${result.length === 1 ? '' : 's'}.`, ['actor_id', 'director_id'], result))
  return { input, result, frames }
}
