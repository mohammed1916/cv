const SQL = `WITH ordered AS (
  SELECT person_name, weight, turn,
    SUM(weight) OVER (ORDER BY turn) AS running
  FROM Queue
)
SELECT person_name
FROM ordered
WHERE running <= 1000
ORDER BY turn DESC
LIMIT 1;`

const PY = `import pandas as pd

def last_person_to_fit(queue):
    ordered = queue.sort_values("turn").copy()
    ordered["running"] = ordered["weight"].cumsum()
    fitting = ordered[ordered["running"] <= 1000]
    return fitting[["person_name"]].tail(1)
`

const CAPACITY = 1000
const snap = rows => JSON.parse(JSON.stringify(rows))
const SQL_LINES = SQL.split('\n')
const PY_LINES = PY.split('\n')
function lookup(lines, fragment, label) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`${label} has no line containing "${fragment}"`)
  return index + 1
}
const sqlLine = fragment => lookup(SQL_LINES, fragment, 'SQL')
const pyLine = fragment => lookup(PY_LINES, fragment, 'Python')
const frame = (phase, sqlFragment, pyFragment, message, rows) => ({
  phase, activeLine: sqlLine(sqlFragment), pythonLine: pyLine(pyFragment), message, rows: snap(rows),
})

export const sql = SQL
export const python = PY
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const phases = [
  { id: 'load', label: 'Queue', description: 'Put the queue in boarding order.' },
  { id: 'accumulate', label: 'Add', description: 'Add each weight to the running total.' },
  { id: 'stop', label: 'Stop', description: 'The next person would exceed the limit.' },
  { id: 'pick', label: 'Pick', description: 'The last person still on board.' },
  { id: 'done', label: 'Result', description: 'Report that person.' },
]
export const sample = {
  queue: [
    { person_id: 1, person_name: 'Alice', weight: 200, turn: 1 },
    { person_id: 2, person_name: 'Ben', weight: 300, turn: 2 },
    { person_id: 3, person_name: 'Cara', weight: 450, turn: 3 },
    { person_id: 4, person_name: 'Dan', weight: 250, turn: 4 },
    { person_id: 5, person_name: 'Eve', weight: 100, turn: 5 },
  ],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.queue)) throw new Error('Provide a queue array.')
  const turns = new Set(input.queue.map(p => p.turn))
  if (turns.size !== input.queue.length) throw new Error('turn must be unique.')
  if (input.queue.some(p => !(p.weight > 0))) throw new Error('Every weight must be positive.')
  return input
}

export function buildTrace(input) {
  const ordered = [...input.queue].sort((a, b) => a.turn - b.turn)
  const frames = [frame('load', 'FROM Queue', 'ordered = queue.sort_values', 'Boarding order is by turn.', ordered)]
  const rows = []
  let running = 0
  let last = null
  for (const person of ordered) {
    running += person.weight
    rows.push({ person_name: person.person_name, weight: person.weight, turn: person.turn, running })
    if (running > CAPACITY) {
      frames.push(frame('stop', 'WHERE running', 'fitting = ordered[', `${person.person_name} would make the total ${running}, so boarding stops.`, rows))
      break
    }
    last = person.person_name
    frames.push(frame('accumulate', 'SUM(weight) OVER', 'ordered["running"] =', `${person.person_name} fits with a running total of ${running}.`, rows))
  }
  const result = last === null ? [] : [{ person_name: last }]
  frames.push(frame('pick', 'ORDER BY turn DESC', 'return fitting', `The last person still on board is ${last ?? 'nobody'}.`, result))
  frames.push(frame('done', 'LIMIT 1', 'return fitting', 'Result returned.', result))
  return { input, result, frames }
}
