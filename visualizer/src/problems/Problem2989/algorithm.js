// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH totals AS (
  SELECT student_id,
         assignment1 + assignment2 + assignment3 AS total_score
  FROM Scores
)
SELECT MAX(total_score) - MIN(total_score) AS difference_in_score
FROM totals`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def class_performance(scores):
    totals = scores[["assignment1", "assignment2", "assignment3"]].sum(axis=1)
    spread = totals.max() - totals.min()
    return pd.DataFrame({"difference_in_score": [spread]})`
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
  { id: 'load', label: 'Load', description: 'Read each student’s three scores.' },
  { id: 'totals', label: 'Totals', description: 'Add the three assignments for each student.' },
  { id: 'spread', label: 'Spread', description: 'Find the highest and lowest totals.' },
  { id: 'done', label: 'Result', description: 'Report the difference.' },
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Scores table.')
  return { Scores: tableRows(input, 'Scores', ['student_id', 'student_name', 'assignment1', 'assignment2', 'assignment3']) }
}

export function buildTrace(input) {
  const rows = input.Scores
  const frames = []
  frames.push(frame('load', 'FROM Scores', 'def class_performance', 'Read each student’s three scores.', ['student_id', 'student_name', 'assignment1', 'assignment2', 'assignment3'], rows))

  const totals = []
  for (const row of rows) {
    const total = row.assignment1 + row.assignment2 + row.assignment3
    totals.push({ student_id: row.student_id, student_name: row.student_name, total_score: total })
    frames.push(frame('totals', 'assignment1 + assignment2', 'totals = ', `${row.student_name} totals ${total} (${row.assignment1} + ${row.assignment2} + ${row.assignment3}).`, ['student_id', 'student_name', 'total_score'], totals))
  }

  const values = totals.map(row => row.total_score)
  const highest = Math.max(...values)
  const lowest = Math.min(...values)
  frames.push(frame('spread', 'FROM totals', 'spread = ', `Highest total ${highest}, lowest total ${lowest}.`, ['highest_total', 'lowest_total'], [{ highest_total: highest, lowest_total: lowest }]))

  const result = [{ difference_in_score: highest - lowest }]
  frames.push(frame('done', 'AS difference_in_score', 'return', `The difference is ${highest - lowest}.`, ['difference_in_score'], result))
  return { input, result, frames }
}
