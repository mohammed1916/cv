// Knowledge-derived teaching model. Sample tables and wording are original.
const NAME = /^[A-Za-z]{1,12}$/

export const code = `select s.student_id, s.student_name
from Student s
join Exam e on e.student_id = s.student_id
where s.student_id not in (
  select e2.student_id from Exam e2
  where e2.score = (select min(e3.score) from Exam e3 where e3.exam_id = e2.exam_id)
     or e2.score = (select max(e4.score) from Exam e4 where e4.exam_id = e2.exam_id))
group by s.student_id, s.student_name
order by s.student_id`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`No SQL line contains "${s}"`)
  return index + 1
}

export const python = `import pandas as pd

def quiet_students(student, exam):
    lowest = exam.groupby('exam_id')['score'].transform('min')
    highest = exam.groupby('exam_id')['score'].transform('max')
    extreme = (exam['score'] == lowest) | (exam['score'] == highest)
    loud_ids = exam.loc[extreme, 'student_id'].unique()
    took = student[student['student_id'].isin(exam['student_id'])]
    quiet = took[~took['student_id'].isin(loud_ids)]
    return quiet[['student_id', 'student_name']].sort_values('student_id')
`

const pythonLines = python.split('\n')
const P = s => {
  const index = pythonLines.findIndex(t => t.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}"`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with students and exams.')
  const { students, exams } = input
  if (!Array.isArray(students) || students.length < 1 || students.length > 8) throw new Error('students has 1 to 8 rows.')
  if (!Array.isArray(exams) || exams.length > 12) throw new Error('exams has at most 12 rows.')
  const ids = new Set()
  for (const s of students) {
    if (!Number.isInteger(s.student_id) || typeof s.student_name !== 'string' || !NAME.test(s.student_name)) throw new Error('Each student needs an integer id and a letters-only name.')
    if (ids.has(s.student_id)) throw new Error('Student ids must be unique.')
    ids.add(s.student_id)
  }
  const pairs = new Set()
  for (const e of exams) {
    if (!Number.isInteger(e.exam_id) || !ids.has(e.student_id)) throw new Error('Each exam row needs an integer exam_id and a listed student_id.')
    if (!Number.isInteger(e.score) || e.score < 0 || e.score > 100) throw new Error('score is an integer from 0 to 100 in this visualization.')
    const key = `${e.exam_id}:${e.student_id}`
    if (pairs.has(key)) throw new Error('A student can appear once per exam.')
    pairs.add(key)
  }
  return {
    students: students.map(({ student_id, student_name }) => ({ student_id, student_name })),
    exams: exams.map(({ exam_id, student_id, score }) => ({ exam_id, student_id, score })),
  }
}

const frame = (phase, activeLine, pythonLine, message, columns, rows) => ({
  phase, activeLine, pythonLine, message, columns, rows: rows.map(row => ({ ...row })),
})

// Returns the role of each exam row: 'low', 'high', both joined by a comma, or '' for neither.
function markRoles(exams, checkedExamIds) {
  return exams.map(e => {
    if (!checkedExamIds.has(e.exam_id)) return { ...e, role: '' }
    const rows = exams.filter(x => x.exam_id === e.exam_id)
    const low = Math.min(...rows.map(x => x.score))
    const high = Math.max(...rows.map(x => x.score))
    return { ...e, role: [e.score === low ? 'low' : '', e.score === high ? 'high' : ''].filter(Boolean).join(', ') }
  })
}

export function buildTrace({ students, exams }) {
  const frames = []
  const examColumns = ['exam_id', 'student_id', 'score', 'role']
  frames.push(frame('load', L('from Student s'), P('def quiet_students'),
    'Load the exam scores. Role is filled in as each exam is checked.', examColumns, markRoles(exams, new Set())))

  const examIds = [...new Set(exams.map(e => e.exam_id))]
  examIds.forEach((examId, i) => {
    const checked = new Set(examIds.slice(0, i + 1))
    const mine = exams.filter(e => e.exam_id === examId)
    const low = Math.min(...mine.map(e => e.score))
    const high = Math.max(...mine.map(e => e.score))
    frames.push(frame('extremes', L('where e2.score'), P('lowest ='),
      `Exam ${examId}: lowest ${low}, highest ${high}. Every student at either value is flagged.`, examColumns, markRoles(exams, checked)))
  })

  const flagged = markRoles(exams, new Set(examIds))
  const loud = [...new Set(flagged.filter(e => e.role !== '').map(e => e.student_id))]
  frames.push(frame('flag', L('or e2.score'), P('extreme ='),
    `Flagged students (any role): ${loud.join(', ') || 'none'}.`, examColumns, flagged))

  const took = students.filter(s => exams.some(e => e.student_id === s.student_id))
  const status = took.map(s => ({ student_id: s.student_id, student_name: s.student_name, quiet: loud.includes(s.student_id) ? 'no' : 'yes' }))
  frames.push(frame('filter', L('where s.student_id not in'), P('quiet = took'),
    'Only students with at least one exam are considered. Keep those never flagged.', ['student_id', 'student_name', 'quiet'], status))

  const result = status
    .filter(row => row.quiet === 'yes')
    .map(({ student_id, student_name }) => ({ student_id, student_name }))
    .sort((a, b) => a.student_id - b.student_id)
  frames.push(frame('output', L('order by s.student_id'), P('return quiet'),
    'Result: quiet students ordered by student_id.', ['student_id', 'student_name'], result))

  return { input: { students, exams }, result, frames }
}
