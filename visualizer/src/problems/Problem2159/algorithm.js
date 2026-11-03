// Knowledge-derived SQL walkthrough. The sample values are invented for this visualization.
export const sql = `WITH FirstSorted AS (
  SELECT first_col, ROW_NUMBER() OVER (ORDER BY first_col ASC) AS pos
  FROM Data
),
SecondSorted AS (
  SELECT second_col, ROW_NUMBER() OVER (ORDER BY second_col DESC) AS pos
  FROM Data
)
SELECT f.first_col, s.second_col
FROM FirstSorted f
JOIN SecondSorted s ON s.pos = f.pos
ORDER BY f.pos`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def order_two_columns(data):
    first = data["first_col"].sort_values(ascending=True).reset_index(drop=True)
    second = data["second_col"].sort_values(ascending=False).reset_index(drop=True)
    return pd.DataFrame({"first_col": first, "second_col": second})`
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
  { id: 'load', label: 'Load', description: 'Read the two columns of the data table.' },
  { id: 'first', label: 'First column', description: 'Sort first_col ascending and number the positions.' },
  { id: 'second', label: 'Second column', description: 'Sort second_col descending and number the positions.' },
  { id: 'done', label: 'Result', description: 'Pair the two columns by position.' },
]

function tableRows(input) {
  const rows = input.Data
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error('Data needs 1 to 12 rows.')
  return rows.map(row => {
    if (!row || typeof row !== 'object' || !('first_col' in row) || !('second_col' in row)) throw new Error('Data rows need first_col and second_col.')
    if (!Number.isInteger(row.first_col) || !Number.isInteger(row.second_col)) throw new Error('Values must be whole numbers.')
    return { first_col: row.first_col, second_col: row.second_col }
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Data table.')
  return { Data: tableRows(input) }
}

export function buildTrace(input) {
  const { Data } = input
  const frames = [frame('load', 'WITH FirstSorted', 'def order_two_columns', 'Read the data rows. The original row pairing is about to be broken.', ['first_col', 'second_col'], Data)]
  const firstOrder = [...Data].map(row => row.first_col).sort((a, b) => a - b)
    .map((value, index) => ({ pos: index + 1, first_col: value }))
  frames.push(frame('first', 'ORDER BY first_col ASC', 'first = data', 'first_col sorted ascending, with a position for each value.', ['pos', 'first_col'], firstOrder))
  const secondOrder = [...Data].map(row => row.second_col).sort((a, b) => b - a)
    .map((value, index) => ({ pos: index + 1, second_col: value }))
  frames.push(frame('second', 'ORDER BY second_col DESC', 'second = data', 'second_col sorted descending, with a position for each value.', ['pos', 'second_col'], secondOrder))
  const result = firstOrder.map((row, index) => ({ first_col: row.first_col, second_col: secondOrder[index].second_col }))
  frames.push(frame('done', 'ORDER BY f.pos', 'return pd.DataFrame', `Pair position by position: ${result.length} rows.`, ['first_col', 'second_col'], result))
  return { input, result, frames }
}
