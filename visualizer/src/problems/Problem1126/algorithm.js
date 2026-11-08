// Knowledge-derived teaching model. The sample tables are invented for this visualization.
export function snap(rows) {
  return rows.map(row => ({ ...row }))
}

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export function parseJsonObject(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object whose keys name the tables.')
  return input
}

export function requireRows(input, name, columns, maxRows = 12) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length > maxRows) throw new Error(`${name} must be a list of at most ${maxRows} rows.`)
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${name} row ${index + 1} must be an object.`)
    columns.forEach(column => { if (!(column in row)) throw new Error(`${name} row ${index + 1} needs ${column}.`) })
  })
  return rows
}

export const sql = `WITH averages AS (
  SELECT event_type, AVG(occurrences) AS avg_occurrences
  FROM Events
  GROUP BY event_type
)
SELECT e.business_id
FROM Events e
JOIN averages a ON e.event_type = a.event_type
WHERE e.occurrences > a.avg_occurrences
GROUP BY e.business_id
HAVING COUNT(*) > 1
ORDER BY e.business_id`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def active_businesses(events):
    averages = events.groupby("event_type")["occurrences"].mean().rename("avg_occurrences")
    joined = events.join(averages, on="event_type")
    above = joined[joined["occurrences"] > joined["avg_occurrences"]]
    counts = above.groupby("business_id").size()
    chosen = counts[counts > 1].index.to_frame(index=False)
    return chosen.sort_values("business_id")`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the event rows.' },
  { id: 'average', label: 'Average', description: 'Average the occurrences of each event type.' },
  { id: 'join', label: 'Join', description: 'Attach each type average to its rows.' },
  { id: 'compare', label: 'Compare', description: 'Keep rows above their type average.' },
  { id: 'count', label: 'Count', description: 'Count the types each business beats.' },
  { id: 'order', label: 'Order', description: 'Keep businesses beating at least two types.' },
  { id: 'done', label: 'Result', description: 'Output the business ids.' },
]
export const inputLabel = 'JSON object with an events table'
export const complexity = 'Linear in the number of event rows after one pass to compute the averages.'
const COLS = ['business_id', 'event_type', 'occurrences']
const SAMPLE = { events: [
  { business_id: 1, event_type: 'reviews', occurrences: 8 },
  { business_id: 1, event_type: 'ads', occurrences: 5 },
  { business_id: 1, event_type: 'page views', occurrences: 2 },
  { business_id: 2, event_type: 'reviews', occurrences: 2 },
  { business_id: 2, event_type: 'ads', occurrences: 7 },
  { business_id: 3, event_type: 'reviews', occurrences: 3 },
  { business_id: 3, event_type: 'ads', occurrences: 1 },
  { business_id: 3, event_type: 'page views', occurrences: 12 },
] }
export const examples = [
  { label: 'Teaching sample', input: JSON.stringify(SAMPLE) },
  { label: 'Single row', input: '{"events":[{"business_id":1,"event_type":"ads","occurrences":3}]}' },
  { label: 'Equal counts', input: '{"events":[{"business_id":2,"event_type":"reviews","occurrences":4},{"business_id":3,"event_type":"reviews","occurrences":4}]}' },
  { label: 'Long run: 12 rows, 4 businesses', input: '{"events":[{"business_id":2,"event_type":"page views","occurrences":2},{"business_id":2,"event_type":"reviews","occurrences":17},{"business_id":4,"event_type":"reviews","occurrences":8},{"business_id":4,"event_type":"reviews","occurrences":19},{"business_id":4,"event_type":"reviews","occurrences":16},{"business_id":1,"event_type":"ads","occurrences":1},{"business_id":1,"event_type":"ads","occurrences":10},{"business_id":1,"event_type":"ads","occurrences":13},{"business_id":3,"event_type":"ads","occurrences":8},{"business_id":3,"event_type":"reviews","occurrences":17},{"business_id":4,"event_type":"ads","occurrences":12},{"business_id":4,"event_type":"page views","occurrences":17}]}' },
]

export function parseInput(text) {
  const input = parseJsonObject(text)
  requireRows(input, 'events', COLS)
  return input
}

export function buildTrace(input) {
  const events = input.events
  const frames = [frameAt('load', 'WITH averages', 'def active_businesses', `Load ${events.length} event rows.`, COLS, events)]
  const groups = new Map()
  for (const row of events) {
    const group = groups.get(row.event_type) || { sum: 0, count: 0 }
    group.sum += row.occurrences
    group.count += 1
    groups.set(row.event_type, group)
  }
  const averages = [...groups].map(([event_type, group]) => ({ event_type, avg_occurrences: group.sum / group.count }))
  frames.push(frameAt('average', 'AVG(occurrences)', 'groupby("event_type")', `Average each of the ${averages.length} event types.`, ['event_type', 'avg_occurrences'], averages))
  const avgOf = new Map(averages.map(row => [row.event_type, row.avg_occurrences]))
  const joined = events.map(row => ({ ...row, avg_occurrences: avgOf.get(row.event_type) }))
  frames.push(frameAt('join', 'JOIN averages', 'events.join(averages', 'Attach the average of each row’s type.', [...COLS, 'avg_occurrences'], joined))
  const above = joined.filter(row => row.occurrences > row.avg_occurrences)
  frames.push(frameAt('compare', 'WHERE e.occurrences', 'above = joined', `${above.length} rows are strictly above their type average.`, [...COLS, 'avg_occurrences'], above))
  const perBusiness = new Map()
  for (const row of above) perBusiness.set(row.business_id, (perBusiness.get(row.business_id) || 0) + 1)
  const counted = [...perBusiness].map(([business_id, types_above]) => ({ business_id, types_above }))
  frames.push(frameAt('count', 'HAVING COUNT(*) > 1', 'counts = above', 'Count the types each business beats.', ['business_id', 'types_above'], counted))
  const result = counted
    .filter(row => row.types_above > 1)
    .map(row => ({ business_id: row.business_id }))
    .sort((a, b) => a.business_id - b.business_id)
  frames.push(frameAt('order', 'ORDER BY e.business_id', 'sort_values("business_id")', 'Keep businesses that beat more than one type, in id order.', ['business_id'], result))
  frames.push(frameAt('done', 'SELECT e.business_id', 'return chosen', 'Output the qualifying business ids.', ['business_id'], result))
  return { input, result, frames }
}
