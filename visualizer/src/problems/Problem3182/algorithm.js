// SQL walkthrough. The sample tables are invented for this visualization.
// The criterion: a student must take every course of their major and earn an A in each of them.
export const sql = `WITH required AS (
  SELECT s.student_id, c.course_id
  FROM Students s
  JOIN Courses c ON c.major = s.major
),
required_count AS (
  SELECT student_id, COUNT(*) AS required_courses
  FROM required
  GROUP BY student_id
),
scored AS (
  SELECT r.student_id,
         COUNT(DISTINCT e.course_id) AS taken,
         SUM(CASE WHEN e.grade = 'A' THEN 1 ELSE 0 END) AS a_count
  FROM required r
  JOIN Enrollments e ON e.student_id = r.student_id AND e.course_id = r.course_id
  GROUP BY r.student_id
)
SELECT s.student_id
FROM Students s
JOIN required_count rc ON rc.student_id = s.student_id
JOIN scored sc ON sc.student_id = s.student_id
WHERE sc.taken = rc.required_courses
  AND sc.a_count = rc.required_courses
ORDER BY s.student_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def top_scoring(students, courses, enrollments):
    required = students.merge(courses, on="major")[["student_id", "course_id"]]
    required_count = required.groupby("student_id").size().rename("required_courses")
    mine = required.merge(enrollments, on=["student_id", "course_id"])
    scored = mine.groupby("student_id").agg(taken=("course_id", "nunique"), a_count=("grade", lambda g: (g == "A").sum()))
    joined = students.set_index("student_id").join(required_count).join(scored)
    kept = joined[(joined["taken"] == joined["required_courses"]) & (joined["a_count"] == joined["required_courses"])]
    return kept.reset_index()[["student_id"]].sort_values("student_id").to_dict("records")`
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
  { id: 'load', label: 'Load', description: 'Read the students, courses and enrollments.' },
  { id: 'pairs', label: 'Required', description: 'Pair each student with the courses of their major.' },
  { id: 'count', label: 'Count', description: 'Count the required courses per student.' },
  { id: 'grade', label: 'Grades', description: 'Check each student has an A in every required course.' },
  { id: 'done', label: 'Result', description: 'Return the top scoring students.' },
]

const STUDENT_COLUMNS = ['student_id', 'name', 'major']
const COURSE_COLUMNS = ['course_id', 'name', 'credits', 'major']
const ENROLL_COLUMNS = ['student_id', 'course_id', 'semester', 'grade']

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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Students, Courses and Enrollments tables.')
  const Students = tableRows(input, 'Students', STUDENT_COLUMNS)
  const Courses = tableRows(input, 'Courses', COURSE_COLUMNS)
  const Enrollments = tableRows(input, 'Enrollments', ENROLL_COLUMNS)
  for (const row of Students) if (!Number.isInteger(row.student_id)) throw new Error('student_id is an integer.')
  for (const row of Courses) if (!Number.isInteger(row.course_id)) throw new Error('course_id is an integer.')
  for (const row of Enrollments) {
    if (!Number.isInteger(row.student_id) || !Number.isInteger(row.course_id)) throw new Error('student_id and course_id are integers.')
      if (!['A', 'B', 'C', 'D', 'F'].includes(row.grade)) throw new Error('grade is A, B, C, D or F.')
  }
  return { Students, Courses, Enrollments }
}

export function buildTrace(input) {
  const { Students, Courses, Enrollments } = input
  const frames = []
  frames.push(frame('load', 'FROM Students', 'def ', `Load ${Students.length} students, ${Courses.length} courses and ${Enrollments.length} enrollments.`, STUDENT_COLUMNS, Students))

  const required = []
  for (const student of Students) {
    for (const course of Courses) {
      if (course.major === student.major) required.push({ student_id: student.student_id, course_id: course.course_id })
    }
  }
  frames.push(frame('pairs', 'JOIN Courses', 'required = ', `${required.length} required pair${required.length === 1 ? '' : 's'} match a student's major.`, ['student_id', 'course_id'], required))

  const counts = Students.map(student => ({ student_id: student.student_id, required_courses: required.filter(pair => pair.student_id === student.student_id).length }))
  frames.push(frame('count', 'required_count AS', 'required_count = ', 'Count the required courses for each student; zero means no requirement to meet.', ['student_id', 'required_courses'], counts))

  const summary = []
  const result = []
  for (const student of Students) {
    const need = required.filter(pair => pair.student_id === student.student_id)
    const mine = Enrollments.filter(row => row.student_id === student.student_id && need.some(pair => pair.course_id === row.course_id))
    const taken = new Set(mine.map(row => row.course_id)).size
    const aCount = mine.filter(row => row.grade === 'A').length
    const kept = need.length > 0 && taken === need.length && aCount === need.length
    summary.push({ student_id: student.student_id, required_courses: need.length, taken, a_count: aCount, kept: kept ? 'yes' : 'no' })
    if (kept) result.push({ student_id: student.student_id })
    frames.push(frame('grade', 'scored AS', 'scored = ', `${student.name}: ${taken} of ${need.length} required taken, ${kept ? 'qualifies' : 'does not qualify'}.`, ['student_id', 'required_courses', 'taken', 'a_count', 'kept'], summary))
  }
  result.sort((a, b) => a.student_id - b.student_id)
  frames.push(frame('done', 'ORDER BY s.student_id', 'return', `Return ${result.length} student${result.length === 1 ? '' : 's'}.`, ['student_id'], result))
  return { input, result, frames }
}
