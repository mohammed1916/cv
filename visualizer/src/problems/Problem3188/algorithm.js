const SQL = `WITH good_average AS (
  SELECT student_id
  FROM enrollments
  GROUP BY student_id
  HAVING AVG(GPA) >= 2.5
)
SELECT s.student_id
FROM students s
JOIN good_average USING (student_id)
JOIN courses c ON c.major = s.major
LEFT JOIN enrollments e
  ON e.student_id = s.student_id AND e.course_id = c.course_id
GROUP BY s.student_id
HAVING SUM(c.mandatory = 'Yes' AND (e.grade IS NULL OR e.grade <> 'A')) = 0
  AND SUM(c.mandatory = 'No' AND e.grade NOT IN ('A', 'B')) = 0
  AND COUNT(DISTINCT CASE WHEN c.mandatory = 'No' THEN e.course_id END) >= 2
ORDER BY s.student_id;`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def top_students(students, courses, enrollments):
    taken = {}
    for student_id, course_id, _, grade, gpa in enrollments:
        taken.setdefault(student_id, []).append((course_id, grade, gpa))
    result = []
    for student_id, _, major in students:
        rows = taken.get(student_id, [])
        if not rows or sum(row[2] for row in rows) < 2.5 * len(rows):
            continue
        own_courses = [course for course in courses if course[3] == major]
        mandatory_ok = True
        electives_ok = True
        electives = set()
        for course_id, _, _, _, mandatory in own_courses:
            grades = [row[1] for row in rows if row[0] == course_id]
            if mandatory == "Yes":
                if not grades or any(grade != "A" for grade in grades):
                    mandatory_ok = False
            elif grades:
                electives.add(course_id)
                if any(grade not in ("A", "B") for grade in grades):
                    electives_ok = False
        if own_courses and mandatory_ok and electives_ok and len(electives) >= 2:
            result.append(student_id)
    return sorted(result)
`

const LIMITS = { students: 8, courses: 12, enrollments: 40 }

const text = value => typeof value === 'string' && value.length > 0
export function parseInput(source) {
  const input = JSON.parse(source)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with students, courses and enrollments.')
  for (const name of Object.keys(LIMITS)) {
    if (!Array.isArray(input[name]) || input[name].length > LIMITS[name]) throw new Error(`${name} is a list of at most ${LIMITS[name]} rows here.`)
  }
  const studentIds = new Set()
  const students = input.students.map(row => {
    if (!Array.isArray(row) || row.length !== 3 || !Number.isInteger(row[0]) || !text(row[1]) || !text(row[2])) throw new Error('Each student is [student_id, name, major].')
    if (studentIds.has(row[0])) throw new Error('student_id must be unique.')
    studentIds.add(row[0])
    return { student_id: row[0], name: row[1], major: row[2] }
  })
  const courseIds = new Set()
  const courses = input.courses.map(row => {
    if (!Array.isArray(row) || row.length !== 5 || !Number.isInteger(row[0]) || !text(row[1]) || !Number.isInteger(row[2]) || !text(row[3]) || !/^(yes|no)$/i.test(row[4])) throw new Error('Each course is [course_id, name, credits, major, "Yes" or "No"].')
    if (courseIds.has(row[0])) throw new Error('course_id must be unique.')
    courseIds.add(row[0])
    return { course_id: row[0], name: row[1], credits: row[2], major: row[3], mandatory: /^yes$/i.test(row[4]) ? 'Yes' : 'No' }
  })
  const enrollmentKeys = new Set()
  const enrollments = input.enrollments.map(row => {
    if (!Array.isArray(row) || row.length !== 5 || !Number.isInteger(row[0]) || !Number.isInteger(row[1]) || !text(row[2]) || !text(row[3]) || typeof row[4] !== 'number' || row[4] < 0 || row[4] > 4) throw new Error('Each enrollment is [student_id, course_id, semester, grade, GPA from 0 to 4].')
    if (!studentIds.has(row[0])) throw new Error(`Enrollment names unknown student ${row[0]}.`)
    if (!courseIds.has(row[1])) throw new Error(`Enrollment names unknown course ${row[1]}.`)
    const key = `${row[0]}|${row[1]}|${row[2]}`
    if (enrollmentKeys.has(key)) throw new Error('Each student, course and semester appears once.')
    enrollmentKeys.add(key)
    return { student_id: row[0], course_id: row[1], semester: row[2], grade: row[3], GPA: row[4] }
  })
  return { students, courses, enrollments }
}

const sqlLines = code.map(entry => entry.text)
const pythonLines = python.split('\n')
const lineIn = (lines, fragment) => {
  const index = lines.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Line missing: ${fragment}`)
  return index + 1
}
const L = fragment => lineIn(sqlLines, fragment)
const P = fragment => lineIn(pythonLines, fragment)

export function buildTrace({ students, courses, enrollments }) {
  const frames = []
  const board = students.map(s => ({ student_id: s.student_id, name: s.name, major: s.major, average: '·', mandatory: '·', electives: '·', result: 'waiting' }))
  const result = []
  const push = (phase, codeLine, pyLine, message, extra = {}) => frames.push({
    phase, activeLine: L(codeLine), pythonLine: P(pyLine), message,
    board: board.map(row => ({ ...row })), current: -1, detailTitle: '', detail: null, activeDetail: -1, checks: null, output: [...result], ...extra,
  })
  push('load', 'WITH good_average AS', 'def top_students', `Start with ${students.length} students, ${courses.length} courses and ${enrollments.length} enrollments.`)

  const passing = []
  students.forEach((student, index) => {
    const mine = enrollments.filter(row => row.student_id === student.student_id)
    // Hundredths keep the 2.5 boundary exact, as a DECIMAL column does.
    const hundredths = mine.reduce((sum, row) => sum + Math.round(row.GPA * 100), 0)
    const ok = mine.length > 0 && hundredths >= 250 * mine.length
    const average = mine.length ? (hundredths / mine.length / 100).toFixed(2) : 'no rows'
    board[index].average = average
    if (ok) passing.push(index)
    else board[index].result = mine.length ? 'out: low average' : 'out: no enrollments'
    push('average', 'HAVING AVG(GPA) >= 2.5', 'if not rows or sum', mine.length
      ? `${student.name} averages ${average} over all ${mine.length} enrollment${mine.length === 1 ? '' : 's'}, courses outside the major included: ${ok ? 'stays' : 'filtered out'}.`
      : `${student.name} has no enrollments, so GROUP BY never produces a row.`, {
      current: index, detailTitle: `Every enrollment of ${student.name}`,
      detail: { columns: ['course_id', 'semester', 'grade', 'GPA'], rows: mine.map(row => ({ course_id: row.course_id, semester: row.semester, grade: row.grade, GPA: row.GPA })) },
    })
  })

  for (const index of passing) {
    const student = students[index]
    const own = courses.filter(course => course.major === student.major)
    const rows = []
    for (const course of own) {
      const attempts = enrollments.filter(row => row.student_id === student.student_id && row.course_id === course.course_id)
      if (attempts.length === 0) rows.push({ course: course.name, course_id: course.course_id, type: course.mandatory === 'Yes' ? 'mandatory' : 'elective', semester: null, grade: null, verdict: '·' })
      for (const attempt of attempts) rows.push({ course: course.name, course_id: course.course_id, type: course.mandatory === 'Yes' ? 'mandatory' : 'elective', semester: attempt.semester, grade: attempt.grade, verdict: '·' })
    }
    const showRows = () => ({ columns: ['course', 'type', 'semester', 'grade', 'verdict'], rows: rows.map(row => ({ ...row })) })
    const title = `${student.name}: courses of ${student.major} with left-joined grades`
    if (own.length === 0) {
      board[index].result = 'out: no major courses'
      push('join', 'JOIN courses c ON', 'own_courses = ', `${student.major} has no courses, so the inner join leaves ${student.name} with no rows.`, { current: index, detailTitle: title, detail: showRows() })
      continue
    }
    push('join', 'LEFT JOIN enrollments e', 'own_courses = ', `Join ${student.name} to all ${own.length} ${student.major} courses. A course never taken keeps a row with NULL grade, which is how a missing mandatory course gets caught.`, { current: index, detailTitle: title, detail: showRows() })

    let badMandatory = 0
    let badElective = 0
    const electives = new Set()
    const mandatoryCount = own.filter(course => course.mandatory === 'Yes').length
    const checks = () => [
      { label: 'Every mandatory row has A', detail: `${badMandatory} failing`, ok: badMandatory === 0 },
      { label: 'Every elective attempt is A or B', detail: `${badElective} failing`, ok: badElective === 0 },
      { label: 'At least 2 electives taken', detail: `${electives.size} taken`, ok: electives.size >= 2 },
    ]
    rows.forEach((row, rowIndex) => {
      let message
      if (row.type === 'mandatory') {
        if (row.grade === 'A') { row.verdict = 'pass'; message = `${row.course} is mandatory and has an A.` }
        else { badMandatory += 1; row.verdict = 'fail'; message = row.grade === null ? `${row.course} is mandatory and was never taken: the grade is NULL.` : `${row.course} is mandatory and has ${row.grade}, not an A.` }
      } else if (row.grade === null) {
        row.verdict = 'not taken'; message = `${row.course} is an elective ${student.name} did not take. That alone is fine.`
      } else {
        electives.add(row.course_id)
        if (row.grade === 'A' || row.grade === 'B') { row.verdict = 'pass'; message = `${row.course} counts as a taken elective, with ${row.grade}.` }
        else { badElective += 1; row.verdict = 'fail'; message = `${row.course} is an elective with ${row.grade}, below B.` }
      }
      board[index].mandatory = `${mandatoryCount - new Set(rows.slice(0, rowIndex + 1).filter(r => r.verdict === 'fail' && r.type === 'mandatory').map(r => r.course_id)).size} of ${mandatoryCount}`
      board[index].electives = `${electives.size} taken`
      const isMandatory = row.type === 'mandatory'
      push('row', isMandatory ? "c.mandatory = 'Yes'" : row.grade === null ? 'COUNT(DISTINCT CASE' : "e.grade NOT IN", isMandatory ? 'if not grades or any' : row.grade === null ? 'elif grades' : 'if any(grade not in', message, {
        current: index, detailTitle: title, detail: showRows(), activeDetail: rowIndex, checks: checks(),
      })
    })
    const allPass = checks().every(check => check.ok)
    board[index].result = allPass ? 'qualifies' : 'out: failed a check'
    if (allPass) result.push(student.student_id)
    push('having', "HAVING SUM(c.mandatory = 'Yes'", 'if own_courses and mandatory_ok', allPass
      ? `All three conditions hold, so ${student.name} qualifies.`
      : `${student.name} misses ${checks().filter(check => !check.ok).map(check => `"${check.label}"`).join(' and ')}.`, {
      current: index, detailTitle: title, detail: showRows(), checks: checks(),
    })
  }
  result.sort((a, b) => a - b)
  push('done', 'ORDER BY s.student_id', 'return sorted(result)', result.length
    ? `Sorted by student_id, the result is ${result.join(', ')}.`
    : 'No student meets every condition, so the result has no rows.')
  return { input: { students, courses, enrollments }, result, frames }
}
