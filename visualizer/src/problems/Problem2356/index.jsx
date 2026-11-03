import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'create an empty group for each teacher_id',
  'for each row of Teacher',
  '  add subject_id to the set of its teacher_id',
  'for each teacher group',
  '  report teacher_id and the size of its set',
].map((text, index) => ({ line: index + 1, text }))

const sql = `SELECT teacher_id,
       COUNT(DISTINCT subject_id) AS cnt
FROM Teacher
GROUP BY teacher_id;`

const python = `def unique_subjects(Teacher):
    groups = {}
    for teacher_id, subject_id, dept_id in Teacher:
        groups.setdefault(teacher_id, set()).add(subject_id)
    return [[t, len(subjects)] for t, subjects in sorted(groups.items())]
`

const PY = { group: 2, add: 4, report: 5, done: 5 }

export function parse(text) {
  const input = JSON.parse(text)
  const rows = input?.Teacher
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error('Teacher is a list of 1 to 12 [teacher_id, subject_id, dept_id] rows.')
  if (!rows.every(r => Array.isArray(r) && r.length === 3 && r.every(Number.isInteger))) throw new Error('Each row is three integers.')
  return { Teacher: rows }
}

export function build({ Teacher }) {
  const groups = new Map()
  const frames = []
  const snap = () => [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([t, set]) => ({ teacher: t, subjects: [...set].sort((a, b) => a - b) }))
  frames.push({ phase: 'group', activeLine: 1, pythonLine: PY.group, message: 'Start with no teachers grouped.', row: -1, groups: snap() })
  Teacher.forEach((row, index) => {
    const [teacher, subject] = row
    if (!groups.has(teacher)) groups.set(teacher, new Set())
    groups.get(teacher).add(subject)
    frames.push({ phase: 'add', activeLine: 3, pythonLine: PY.add, message: `Row ${index + 1}: teacher ${teacher} teaches subject ${subject}; repeats do not count twice.`, row: index, groups: snap() })
  })
  const result = [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([t, set]) => [t, set.size])
  frames.push({ phase: 'report', activeLine: 5, pythonLine: PY.report, message: 'Each group reports its distinct subject count.', row: -1, groups: snap() })
  frames.push({ phase: 'done', activeLine: 5, pythonLine: PY.done, message: `Result: ${result.map(([t, c]) => `teacher ${t} has ${c}`).join(', ')}.`, row: -1, groups: snap() })
  return { input: { Teacher }, result, frames }
}

const definition = {
  phases: [
    { id: 'group', label: 'Group', description: 'Start empty groups.' },
    { id: 'add', label: 'Add rows', description: 'Put each subject in its teacher set.' },
    { id: 'report', label: 'Report', description: 'Count each set.' },
    { id: 'done', label: 'Result', description: 'The answer table.' },
  ],
  parse, build, code, sql, python,
  inputLabel: 'Object with Teacher: list of [teacher_id, subject_id, dept_id] rows',
  url: 'https://leetcode.com/problems/number-of-unique-subjects-taught-by-each-teacher/',
  complexity: 'One pass over the rows with a set per teacher. Repeated (teacher, subject) rows collapse inside the set.',
  examples: [
    { label: 'Example', input: '{"Teacher":[[1,2,3],[1,2,4],[1,3,3],[2,4,1],[2,4,1],[2,1,1]]}' },
  ],
}

export default function UniqueSubjectsPerTeacher() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Teacher groups">
      <thead><tr><th>teacher_id</th><th>Distinct subjects</th><th>cnt</th></tr></thead>
      <tbody>{step.groups.map(g => <tr key={g.teacher}>
        <td>{g.teacher}</td><td>{g.subjects.join(', ')}</td><td>{g.subjects.length}</td>
      </tr>)}</tbody>
    </table>
    <p aria-label="Current row">{step.row >= 0 ? `Row ${step.row + 1}: ${run.input.Teacher[step.row].join(', ')}` : 'All rows grouped'}</p>
  </>} renderReasoning={() => <>
    <p>GROUP BY sends every row of one teacher into one bucket. COUNT(DISTINCT subject_id) is the size of that bucket's set, so duplicated subjects count once.</p>
  </>} />
}
