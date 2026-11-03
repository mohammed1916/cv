// Teaching model of a SQL rewrite: each table row becomes a JavaScript object, and the query becomes a loop plus a sort.
export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty result list. The rows keep their stored order until the sort.' },
  { id: 'transform', label: 'Rewrite name', description: 'Uppercase the first letter of each name and lowercase the rest, keeping the user_id.' },
  { id: 'order', label: 'Order by user_id', description: 'Sort the rewritten rows by user_id in ascending order.' },
  { id: 'done', label: 'Complete', description: 'Return the rewritten rows in user_id order.' },
]

export function parseInput(text) {
  const rows = JSON.parse(text)
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 30) throw new Error('Enter a JSON array of 1 to 30 rows, each {"user_id": integer, "name": letters}.')
  const ids = new Set()
  for (const row of rows) {
    if (!row || typeof row !== 'object' || !Number.isInteger(row.user_id) || row.user_id < 1) throw new Error('Each row needs an integer user_id of at least 1.')
    if (ids.has(row.user_id)) throw new Error(`user_id ${row.user_id} appears twice. user_id is unique.`)
    ids.add(row.user_id)
    if (typeof row.name !== 'string' || !/^[A-Za-z]{1,20}$/.test(row.name)) throw new Error('Each name is 1 to 20 English letters.')
  }
  return rows
}

export function fixName(name) {
  return name[0].toUpperCase() + name.slice(1).toLowerCase()
}

// Pseudocode line numbers used by activeLine, and Python line numbers used by pythonLine.
const C = { start: 2, loop: 3, rewrite: 4, append: 5, sort: 6, done: 7 }
const PY = { start: 2, loop: 3, rewrite: 4, append: 4, sort: 5, done: 6 }

export function buildTrace(rows) {
  const frames = []
  const output = []
  const snap = (index, extra = {}) => ({ index, output: output.map(row => ({ ...row })), ...extra })
  const push = (phase, line, message, snapshot) => frames.push({ phase, activeLine: C[line], pythonLine: PY[line], snapshot, message })

  push('start', 'start', `${rows.length} rows. Rewrite each name, then sort the result by user_id.`, snap(null))
  rows.forEach((row, index) => {
    const fixed = fixName(row.name)
    output.push({ user_id: row.user_id, name: fixed })
    push('transform', 'rewrite', `User ${row.user_id}: "${row.name}" becomes "${fixed}".`, snap(index, { original: row.name, fixed }))
  })
  output.sort((a, b) => a.user_id - b.user_id)
  push('order', 'sort', `Sorted by user_id: ${output.map(row => row.user_id).join(', ')}.`, snap(null))
  push('done', 'done', `Return ${output.length} rows, one per user, ordered by user_id.`, snap(null))
  return { input: rows, result: output, frames }
}

export const code = `fix names (users):
  output = empty list
  for each row in users:
    name = first letter uppercase + remaining letters lowercase
    append (user_id, name) to output
  sort output by user_id ascending
  return output`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def fix_names(users):
    out = []
    for row in users:
        out.append((row["user_id"], row["name"][:1].upper() + row["name"][1:].lower()))
    out.sort()
    return out
`
