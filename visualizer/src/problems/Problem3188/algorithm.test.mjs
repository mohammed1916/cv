import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const COURSES = [[10, 'M1', 3, 'X', 'Yes'], [11, 'M2', 3, 'X', 'Yes'], [12, 'E1', 3, 'X', 'No'], [13, 'E2', 3, 'X', 'No'], [14, 'E3', 3, 'X', 'No'], [20, 'Other', 3, 'Y', 'Yes']]
const solve = (enrollments, students = [[1, 'A', 'X']], courses = COURSES) =>
  buildTrace(parseInput(JSON.stringify({ students, courses, enrollments }))).result
const e = (course, grade, gpa, semester = 'S1', student = 1) => [student, course, semester, grade, gpa]
const CORE = [e(10, 'A', 4), e(11, 'A', 4)]

test('3188 hand-computed cases', () => {
  assert.deepEqual(solve([...CORE, e(12, 'B', 3), e(13, 'A', 4)]), [1])
  assert.deepEqual(solve([...CORE, e(12, 'B', 3)]), [], 'only one elective')
  assert.deepEqual(solve([e(10, 'A', 4), e(12, 'A', 4), e(13, 'A', 4)]), [], 'mandatory course missing')
  assert.deepEqual(solve([e(10, 'A', 4), e(11, 'B', 3), e(12, 'A', 4), e(13, 'A', 4)]), [], 'mandatory B')
  assert.deepEqual(solve([...CORE, e(12, 'A', 4), e(13, 'C', 2)]), [], 'elective C')
  assert.deepEqual(solve([...CORE, e(12, 'A', 4), e(13, 'B', 3), e(14, 'D', 1)]), [], 'third elective D still fails')
  assert.deepEqual(solve([]), [], 'no enrollments')
})

test('3188 average includes courses outside the major', () => {
  assert.deepEqual(solve([...CORE, e(12, 'B', 3), e(13, 'B', 3), e(20, 'F', 0)]), [1], 'weak outside grade, 2.8 average')
  assert.deepEqual(solve([...CORE, e(12, 'B', 3), e(13, 'B', 3), e(20, 'F', 0, 'S1'), e(20, 'F', 0, 'S2'), e(20, 'F', 0, 'S3')]), [], '2.0 average')
  assert.deepEqual(solve([e(10, 'A', 2.5), e(11, 'A', 2.5), e(12, 'B', 2.5), e(13, 'B', 2.5)]), [1], 'exactly 2.5 passes')
  assert.deepEqual(solve([e(10, 'A', 2.49), e(11, 'A', 2.5), e(12, 'B', 2.5), e(13, 'B', 2.5)]), [], 'just below 2.5')
})

test('3188 retakes', () => {
  assert.deepEqual(solve([...CORE, e(12, 'A', 4, 'S1'), e(12, 'B', 3, 'S2')]), [], 'one elective taken twice is one elective')
  assert.deepEqual(solve([...CORE, e(10, 'B', 3, 'S2'), e(12, 'A', 4), e(13, 'A', 4)]), [], 'every mandatory attempt must be A')
})

test('3188 result order and major without courses', () => {
  const students = [[9, 'B', 'X'], [2, 'C', 'X'], [5, 'D', 'Empty']]
  const passing = id => [e(10, 'A', 4, 'S1', id), e(11, 'A', 4, 'S1', id), e(12, 'A', 4, 'S1', id), e(13, 'A', 4, 'S1', id)]
  assert.deepEqual(solve([...passing(9), ...passing(2), e(10, 'A', 4, 'S1', 5)], students), [2, 9])
})

test('3188 lower-case yes and no are accepted', () => {
  const out = solve([e(10, 'A', 4), e(12, 'A', 4), e(13, 'B', 3)], [[1, 'A', 'X']], [[10, 'M', 3, 'X', 'yes'], [12, 'E', 3, 'X', 'no'], [13, 'F', 3, 'X', 'no']])
  assert.deepEqual(out, [1])
})

test('3188 parseInput rejects bad rows', () => {
  const base = { students: [[1, 'A', 'X']], courses: [[10, 'M', 3, 'X', 'Yes']], enrollments: [] }
  assert.doesNotThrow(() => parseInput(JSON.stringify(base)))
  assert.throws(() => parseInput(JSON.stringify({ ...base, students: [[1, 'A', 'X'], [1, 'B', 'X']] })))
  assert.throws(() => parseInput(JSON.stringify({ ...base, courses: [[10, 'M', 3, 'X', 'Maybe']] })))
  assert.throws(() => parseInput(JSON.stringify({ ...base, enrollments: [[2, 10, 'S', 'A', 4]] })))
  assert.throws(() => parseInput(JSON.stringify({ ...base, enrollments: [[1, 10, 'S', 'A', 4], [1, 10, 'S', 'A', 4]] })))
  assert.throws(() => parseInput('[]'))
})

// Oracle: run the query shown on the page, on a real SQL engine.
const sql = code.map(entry => entry.text).join('\n')
function runSql({ students, courses, enrollments }, DatabaseSync) {
  const db = new DatabaseSync(':memory:')
  db.exec(`CREATE TABLE students(student_id INT, name TEXT, major TEXT);
    CREATE TABLE courses(course_id INT, name TEXT, credits INT, major TEXT, mandatory TEXT);
    CREATE TABLE enrollments(student_id INT, course_id INT, semester TEXT, grade TEXT, GPA REAL);`)
  const put = (table, rows) => {
    if (!rows.length) return
    const stmt = db.prepare(`INSERT INTO ${table} VALUES (${rows[0].map(() => '?').join(',')})`)
    for (const row of rows) stmt.run(...row)
  }
  put('students', students)
  put('courses', courses)
  put('enrollments', enrollments)
  const rows = db.prepare(sql).all().map(row => row.student_id)
  db.close()
  return rows
}

test('3188 random tables match the SQL query on a real engine', async t => {
  let DatabaseSync
  try { ({ DatabaseSync } = await import('node:sqlite')) } catch { t.skip('node:sqlite is not available'); return }
  let seed = 3188
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const grades = [['A', 4], ['A', 4], ['A', 4], ['B', 3], ['B', 3], ['C', 2], ['F', 0]]
  let qualified = 0
  for (let round = 0; round < 400; round++) {
    const majors = ['X', 'Y', 'Z']
    const students = Array.from({ length: 1 + rnd(5) }, (_, i) => [i + 1, `s${i}`, majors[rnd(3)]])
    const courses = Array.from({ length: 2 + rnd(6) }, (_, i) => [100 + i, `c${i}`, 3, majors[rnd(2)], rnd(2) ? 'Yes' : 'No'])
    const seen = new Set()
    const enrollments = []
    for (const [id, , major] of students) {
      const own = courses.filter(c => c[3] === major)
      for (const course of own) {
        if (rnd(4) === 0) continue
        const [grade, gpa] = rnd(3) ? grades[rnd(3)] : grades[rnd(grades.length)]
        enrollments.push([id, course[0], 'S1', grade, gpa])
        seen.add(`${id}|${course[0]}|S1`)
      }
      if (rnd(4) === 0) {
        const course = courses[rnd(courses.length)]
        const [grade, gpa] = grades[rnd(grades.length)]
        if (!seen.has(`${id}|${course[0]}|S2`)) { enrollments.push([id, course[0], 'S2', grade, gpa]); seen.add(`${id}|${course[0]}|S2`) }
      }
    }
    const tables = { students, courses, enrollments }
    const got = buildTrace(parseInput(JSON.stringify(tables))).result
    assert.deepEqual(got, runSql(tables, DatabaseSync), JSON.stringify(tables))
    qualified += got.length
  }
  assert.ok(qualified > 0, 'some random students should qualify')
})

test('3188 frames map to real lines', () => {
  const lines = python.split('\n')
  const tables = { students: [[1, 'A', 'X']], courses: COURSES, enrollments: [...CORE, e(12, 'B', 3), e(13, 'A', 4)] }
  const { frames } = buildTrace(parseInput(JSON.stringify(tables)))
  assert.equal(frames[0].phase, 'load')
  assert.equal(frames.at(-1).phase, 'done')
  for (const phase of ['load', 'average', 'join', 'row', 'having', 'done']) assert.ok(frames.some(f => f.phase === phase), phase)
  for (const frame of frames) {
    assert.ok(code[frame.activeLine - 1])
    assert.ok(lines[frame.pythonLine - 1]?.trim())
    assert.ok(frame.message)
  }
  const last = frames.at(-1)
  assert.deepEqual(last.output, [1])
  assert.equal(last.board[0].result, 'qualifies')
})
