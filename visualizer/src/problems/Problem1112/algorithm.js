// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT student_id, course_id, grade
FROM (
  SELECT student_id, course_id, grade,
         ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY grade DESC, course_id ASC) AS rn
  FROM Enrollments
) ranked
WHERE rn = 1
ORDER BY student_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def best_course_per_student(enrollments):
    ranked = enrollments.sort_values(["student_id", "grade", "course_id"], ascending=[True, False, True])
    best = ranked.drop_duplicates("student_id", keep="first")
    return best[["student_id", "course_id", "grade"]].to_dict("records")`
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
  { id: 'load', label: 'Load', description: 'Read the enrollments.' },
  { id: 'rank', label: 'Rank', description: 'Rank each students courses by grade, then course id.' },
  { id: 'pick', label: 'Pick', description: 'Keep the first ranked course of each student.' },
  { id: 'done', label: 'Result', description: 'Output one row per student.' },
]

export const inputLabel = 'Object with an Enrollments table'
export const complexity = 'O(n log n) to sort the enrollments. The visualizer caps the table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Enrollments":[{"student_id":1,"course_id":101,"grade":80},{"student_id":1,"course_id":102,"grade":90},{"student_id":1,"course_id":103,"grade":90},{"student_id":2,"course_id":101,"grade":70},{"student_id":2,"course_id":104,"grade":65},{"student_id":3,"course_id":102,"grade":95}]}',
}, {
  label: 'Single enrollment',
  input: '{"Enrollments":[{"student_id":1,"course_id":5,"grade":80}]}',
}, {
  label: 'Equal grades use the smaller course id',
  input: '{"Enrollments":[{"student_id":7,"course_id":30,"grade":90},{"student_id":7,"course_id":20,"grade":90},{"student_id":7,"course_id":25,"grade":85}]}',
}, {
  label: 'Full and zero grades',
  input: '{"Enrollments":[{"student_id":8,"course_id":1,"grade":0},{"student_id":8,"course_id":2,"grade":100},{"student_id":9,"course_id":3,"grade":0}]}',
}, {
  label: 'Long run: 12 enrollments, 4 students',
  input: '{"Enrollments":[{"student_id":1,"course_id":12,"grade":70},{"student_id":2,"course_id":11,"grade":99},{"student_id":2,"course_id":12,"grade":62},{"student_id":3,"course_id":11,"grade":91},{"student_id":1,"course_id":13,"grade":89},{"student_id":3,"course_id":10,"grade":93},{"student_id":2,"course_id":10,"grade":63},{"student_id":4,"course_id":11,"grade":58},{"student_id":1,"course_id":11,"grade":84},{"student_id":4,"course_id":12,"grade":73},{"student_id":4,"course_id":10,"grade":98},{"student_id":3,"course_id":13,"grade":60}]}',
}]

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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an Enrollments table.')
  return { Enrollments: tableRows(input, 'Enrollments', ['student_id', 'course_id', 'grade']) }
}

export function buildTrace(input) {
  const { Enrollments } = input
  const frames = []
  frames.push(frame('load', 'FROM Enrollments', 'def ', 'Read the enrollments.', ['student_id', 'course_id', 'grade'], Enrollments))

  const byStudent = new Map()
  for (const row of Enrollments) {
    if (!byStudent.has(row.student_id)) byStudent.set(row.student_id, [])
    byStudent.get(row.student_id).push(row)
  }
  const result = []
  for (const student of [...byStudent.keys()].sort((a, b) => a - b)) {
    const ranked = [...byStudent.get(student)]
      .sort((a, b) => b.grade - a.grade || a.course_id - b.course_id)
      .map((row, index) => ({ student_id: row.student_id, course_id: row.course_id, grade: row.grade, rn: index + 1 }))
    frames.push(frame('rank', 'PARTITION BY', 'ranked =', `Rank student ${student}'s courses by grade, then by course id.`, ['student_id', 'course_id', 'grade', 'rn'], ranked))
    const best = ranked[0]
    result.push({ student_id: best.student_id, course_id: best.course_id, grade: best.grade })
    frames.push(frame('pick', 'WHERE rn', 'best =', `Keep course ${best.course_id} for student ${student}.`, ['student_id', 'course_id', 'grade'], result))
  }
  frames.push(frame('done', 'ORDER BY student_id', 'return', `Return ${result.length} student rows.`, ['student_id', 'course_id', 'grade'], result))
  return { input, result, frames }
}
