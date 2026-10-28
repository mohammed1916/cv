export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).sort().join() !== 'm,n,queries') throw new Error('Use an object with exactly the keys "n", "m" and "queries".')
  const { n, m, queries } = value
  if (!Number.isInteger(n) || n < 1 || n > 6 || !Number.isInteger(m) || m < 1 || m > 6) throw new Error('n and m are integers from 1 to 6.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 10) throw new Error('Use 1 to 10 queries.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 3 || ![0, 1].includes(q[0]) || !Number.isInteger(q[1]) || !Number.isInteger(q[2]) || q[2] < 0 || q[2] > 20) throw new Error('Each query is [type, index, value] with type 0 or 1 and value 0 to 20.')
    const limit = q[0] === 0 ? n : m
    if (q[1] < 0 || q[1] >= limit) throw new Error(`Index ${q[1]} is out of range for ${q[0] === 0 ? 'a row' : 'a column'}.`)
  }
  return { n, m, queries }
}

export function buildTrace({ n, m, queries }) {
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), active: -1, roles: {}, state: { total: 0 }, message: 'Process queries from the last one backwards. Only the newest write to each row or column survives.' }]
  const rows = new Set()
  const cols = new Set()
  let total = 0
  for (let k = queries.length - 1; k >= 0; k--) {
    const [kind, index, value] = queries[k]
    const label = kind === 0 ? `row ${index}` : `column ${index}`
    if (kind === 0 && !rows.has(index)) {
      rows.add(index)
      total += value * (m - cols.size)
      frames.push({ phase: 'row', activeLine: L('add value times (m'), active: k, roles: { [k]: 'counted' }, state: { query: label, total }, message: `${label} is set to ${value} and is not overwritten later. Its ${m - cols.size} free cells add ${value * (m - cols.size)}.` })
    } else if (kind === 1 && !cols.has(index)) {
      cols.add(index)
      total += value * (n - rows.size)
      frames.push({ phase: 'column', activeLine: L('add value times (n'), active: k, roles: { [k]: 'counted' }, state: { query: label, total }, message: `${label} is set to ${value} and is not overwritten later. Its ${n - rows.size} free cells add ${value * (n - rows.size)}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('otherwise if the query sets a column'), active: k, roles: { [k]: 'overwritten' }, state: { query: label, total }, message: `${label} is overwritten by a later query, so it contributes nothing.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), active: -1, roles: {}, state: { total }, message: `Sum of the final matrix: ${total}.` })
  return { input: { n, m, queries }, result: total, items: queries.map(([kind, index, value]) => `${kind === 0 ? 'row' : 'col'} ${index} = ${value}`), frames }
}

export const code = `sum of the matrix after all queries
  set total to 0
  set rows and cols to empty sets
  for each query from last to first
    if the query sets a row that is not in rows then
      add the row to rows
      add value times (m minus the size of cols) to total
    otherwise if the query sets a column that is not in cols then
      add the column to cols
      add value times (n minus the size of rows) to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_of_matrix_after_queries(n, m, queries):
    total = 0
    rows = set()
    cols = set()
    for kind, index, value in reversed(queries):
        if kind == 0 and index not in rows:
            rows.add(index)
            total += value * (m - len(cols))
        elif kind == 1 and index not in cols:
            cols.add(index)
            total += value * (n - len(rows))
    return total
`
