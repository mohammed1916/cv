// SQL walkthrough. The sample tables and the score cutoff are invented for this visualization.
export const sql = `WITH ny AS (
  SELECT COUNT(*) AS strong FROM NewYork WHERE score >= 90
),
ca AS (
  SELECT COUNT(*) AS strong FROM California WHERE score >= 90
)
SELECT CASE WHEN ny.strong > ca.strong THEN 'New York University'
            WHEN ny.strong < ca.strong THEN 'California University'
            ELSE 'No Winner' END AS winner
FROM ny CROSS JOIN ca`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def winner_university(new_york, california):
    ny_count = (new_york["score"] >= 90).sum()
    ca_count = (california["score"] >= 90).sum()
    if ny_count > ca_count:
        return "New York University"
    if ca_count > ny_count:
        return "California University"
    return "No Winner"`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Load', description: 'Read both universities’ score lists.' },
  { id: 'count', label: 'Count', description: 'Mark each score that reaches the cutoff.' },
  { id: 'compare', label: 'Compare', description: 'Compare the two counts.' },
  { id: 'done', label: 'Result', description: 'Report the winner or a tie.' },
]

const COLUMNS = ['university', 'student_id', 'score']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with NewYork and California tables.')
  return {
    NewYork: tableRows(input, 'NewYork'),
    California: tableRows(input, 'California'),
  }
}

function tableRows(input, name) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length > 16) throw new Error(`${name} allows at most 16 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || !('student_id' in row) || !('score' in row)) throw new Error(`${name} rows need student_id and score.`)
    if (!Number.isInteger(row.score) || row.score < 0 || row.score > 100) throw new Error('score is an integer from 0 to 100.')
    return { student_id: row.student_id, score: row.score }
  })
}

export function buildTrace(input) {
  const { NewYork, California } = input
  const frames = []
  const push = (phase, sqlKey, pyKey, message, rows) => frames.push({
    phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns: COLUMNS, rows: rows.map(row => ({ ...row })),
  })
  const all = [
    ...NewYork.map(row => ({ university: 'New York', ...row })),
    ...California.map(row => ({ university: 'California', ...row })),
  ]
  push('load', 'FROM NewYork', 'def winner_university', 'Read both score lists.', all)

  const counted = []
  for (const row of NewYork) {
    const yes = row.score >= 90
    counted.push({ university: 'New York', student_id: row.student_id, score: row.score, counted: yes ? 'yes' : 'no' })
    push('count', 'SELECT COUNT(*) AS strong FROM NewYork', 'ny_count =', `New York student ${row.student_id} with ${row.score} ${yes ? 'counts' : 'does not count'}.`, counted)
  }
  for (const row of California) {
    const yes = row.score >= 90
    counted.push({ university: 'California', student_id: row.student_id, score: row.score, counted: yes ? 'yes' : 'no' })
    push('count', 'FROM California WHERE', 'ca_count =', `California student ${row.student_id} with ${row.score} ${yes ? 'counts' : 'does not count'}.`, counted)
  }

  const nyCount = NewYork.filter(row => row.score >= 90).length
  const caCount = California.filter(row => row.score >= 90).length
  const winner = nyCount > caCount ? 'New York University' : caCount > nyCount ? 'California University' : 'No Winner'
  const compareKey = nyCount > caCount ? 'if ny_count > ca_count' : caCount > nyCount ? 'if ca_count > ny_count' : 'return "No Winner"'
  push('compare', 'CASE WHEN ny.strong', compareKey, `New York has ${nyCount} strong scores and California has ${caCount}.`, counted)
  push('done', 'FROM ny CROSS JOIN ca', 'return "No Winner"', `Winner: ${winner}.`, [])
  const result = [{ winner }]
  frames[frames.length - 1].columns = ['winner']
  frames[frames.length - 1].rows = result
  return { input, result, frames }
}
