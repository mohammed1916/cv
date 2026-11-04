// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH free_seats AS (
  SELECT seat_id
  FROM Cinema
  WHERE free = 1
),
numbered AS (
  SELECT seat_id, seat_id - ROW_NUMBER() OVER (ORDER BY seat_id) AS run_key
  FROM free_seats
),
runs AS (
  SELECT run_key, COUNT(*) AS run_length
  FROM numbered
  GROUP BY run_key
)
SELECT MIN(n.seat_id) AS first_seat_id,
  MAX(n.seat_id) AS last_seat_id,
  COUNT(*) AS consecutive_seats_len
FROM numbered n
JOIN runs r ON r.run_key = n.run_key
WHERE r.run_length = (SELECT MAX(run_length) FROM runs)
GROUP BY n.run_key
ORDER BY first_seat_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def consecutive_longest(cinema):
    free = cinema.loc[cinema["free"] == 1, ["seat_id"]].sort_values("seat_id")
    run_key = free["seat_id"].diff().ne(1).cumsum()
    run_length = free.groupby(run_key)["seat_id"].transform("size")
    keep = run_length == run_length.max()
    kept = free.loc[keep].assign(run_key=run_key[keep])
    blocks = kept.groupby("run_key")["seat_id"].agg(first_seat_id="min", last_seat_id="max", consecutive_seats_len="size")
    return blocks.reset_index(drop=True).to_dict("records")`
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
  { id: 'load', label: 'Load', description: 'Read the seat table.' },
  { id: 'filter', label: 'Free', description: 'Keep the free seats in seat order.' },
  { id: 'run', label: 'Number', description: 'Seats in one consecutive block share a key.' },
  { id: 'length', label: 'Length', description: 'Count the seats in each block.' },
  { id: 'pick', label: 'Longest', description: 'Keep seats whose block is longest.' },
  { id: 'done', label: 'Result', description: 'Return the seats of the longest block or blocks.' },
]

const COLUMNS = ['seat_id', 'free']

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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Cinema table.')
  const Cinema = tableRows(input, 'Cinema', COLUMNS)
  const ids = new Set()
  for (const row of Cinema) {
    if (!Number.isInteger(row.seat_id) || row.seat_id < 1) throw new Error('seat_id is a positive integer.')
    if (ids.has(row.seat_id)) throw new Error('seat_id values must be distinct.')
    ids.add(row.seat_id)
    if (row.free !== 0 && row.free !== 1) throw new Error('free is 0 or 1.')
  }
  return { Cinema }
}

export function buildTrace(input) {
  const { Cinema } = input
  const frames = []
  frames.push(frame('load', 'FROM Cinema', 'def ', `Load ${Cinema.length} seats.`, COLUMNS, Cinema))

  const free = Cinema.filter(row => row.free === 1).sort((a, b) => a.seat_id - b.seat_id).map(row => ({ seat_id: row.seat_id }))
  frames.push(frame('filter', 'WHERE free = 1', 'free = ', `${free.length} seat${free.length === 1 ? ' is' : 's are'} free.`, ['seat_id'], free))

  const numbered = free.map((row, index) => ({ seat_id: row.seat_id, run_key: row.seat_id - (index + 1) }))
  frames.push(frame('run', 'ROW_NUMBER', 'run_key =', 'Seat id minus its row number is constant inside one consecutive block.', ['seat_id', 'run_key'], numbered))

  const lengths = new Map()
  for (const row of numbered) lengths.set(row.run_key, (lengths.get(row.run_key) ?? 0) + 1)
  const runs = [...lengths].map(([run_key, run_length]) => ({ run_key, run_length }))
  frames.push(frame('length', 'GROUP BY run_key', 'run_length =', `Found ${runs.length} block${runs.length === 1 ? '' : 's'} of free seats.`, ['run_key', 'run_length'], runs))

  const best = Math.max(0, ...runs.map(run => run.run_length))
  const picked = numbered.map(row => {
    const run_length = lengths.get(row.run_key)
    return { seat_id: row.seat_id, run_key: row.run_key, run_length, kept: run_length === best ? 'yes' : 'no' }
  })
  frames.push(frame('pick', 'WHERE r.run_length', 'keep =', `The longest block has ${best} seat${best === 1 ? '' : 's'}; seats in other blocks are dropped.`, ['seat_id', 'run_key', 'run_length', 'kept'], picked))

  const kept = picked.filter(row => row.kept === 'yes')
  const result = []
  for (const row of kept) {
    const last = result.at(-1)
    if (last && last.run_key === row.run_key) {
      last.last_seat_id = row.seat_id
      last.consecutive_seats_len += 1
    }
    else result.push({ first_seat_id: row.seat_id, last_seat_id: row.seat_id, consecutive_seats_len: 1, run_key: row.run_key })
  }
  const output = result.map(({ run_key, ...rest }) => rest)
  frames.push(frame('done', 'ORDER BY first_seat_id', 'return', `Return ${output.length} block${output.length === 1 ? '' : 's'} with the longest run.`, ['first_seat_id', 'last_seat_id', 'consecutive_seats_len'], output))
  return { input, result: output, frames }
}
