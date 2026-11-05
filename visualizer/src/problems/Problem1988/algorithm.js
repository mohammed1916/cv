export const phases = [
  { id: 'start', label: 'Schools', description: 'Each school has a capacity: the most students it can admit.' },
  { id: 'join', label: 'Join: fits capacity', description: 'Pair each school with every exam score whose cumulative student count fits its capacity.' },
  { id: 'group', label: 'Group: lowest score', description: 'Within each school group, keep the smallest matching score; a school with no match gets -1.' },
  { id: 'done', label: 'Result', description: 'One row per school with its minimum score requirement.' },
]

export const code = `SELECT school_id, MIN(IFNULL(score, -1)) AS score
FROM Schools AS s
LEFT JOIN Exam AS e ON s.capacity >= e.student_count
GROUP BY school_id;`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def cutoff_scores(schools, exam):
    result = []
    for school_id, capacity in schools:
        fitting = [score for score, count in exam if capacity >= count]
        result.append((school_id, min(fitting) if fitting else -1))
    return result
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"schools":[[1,10]],"exam":[[900,5],[800,12]]}.') }
  const { schools, exam } = obj || {}
  if (!Array.isArray(schools) || schools.length < 1 || schools.length > 12) throw new Error('Give 1 to 12 schools as [school_id, capacity].')
  if (!Array.isArray(exam) || exam.length < 1 || exam.length > 12) throw new Error('Give 1 to 12 exam rows as [score, student_count].')
  const scores = new Set()
  for (const [id, capacity] of schools) {
    if (!Number.isInteger(id) || !Number.isInteger(capacity) || capacity < 0) throw new Error('Each school needs an integer id and a capacity of 0 or more.')
  }
  for (const [score, count] of exam) {
    if (!Number.isInteger(score) || !Number.isInteger(count) || count < 0) throw new Error('Each exam row needs an integer score and a student_count of 0 or more.')
    if (scores.has(score)) throw new Error('Exam scores must be unique.')
    scores.add(score)
  }
  // Each row counts students who scored at least this score, so a higher score cannot have more students.
  const byScore = [...exam].sort((a, b) => b[0] - a[0])
  for (let i = 1; i < byScore.length; i++) {
    if (byScore[i][1] < byScore[i - 1][1]) throw new Error('A higher score must have the same or fewer students than a lower score.')
  }
  return { schools, exam }
}

export function buildTrace({ schools, exam }) {
  const frames = []
  const add = (phase, c, p, message, extra) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { schools, exam, pairs: extra.pairs ?? [], groups: extra.groups ?? [], result: extra.result ?? [], focus: extra.focus ?? null },
  })
  add('start', 'FROM Schools', 'for school_id, capacity', `There are ${schools.length} schools and ${exam.length} exam rows.`, {})
  const pairs = []
  for (const [id, capacity] of schools) {
    for (const [score, count] of exam) {
      if (capacity >= count) pairs.push([id, score])
    }
  }
  add('join', 'LEFT JOIN Exam', 'fitting = [score', `The join keeps every school and score where capacity is at least the cumulative count; ${pairs.length} pairs fit.`, { pairs })
  const groups = schools.map(([id]) => {
    const scores = pairs.filter(p => p[0] === id).map(p => p[1])
    return [id, scores.length ? Math.min(...scores) : -1]
  })
  add('group', 'MIN(IFNULL', 'min(fitting)', 'Each school keeps its smallest fitting score, or -1 when none fits.', { pairs, groups, focus: groups[0][0] })
  const result = groups
  add('done', 'GROUP BY school_id', 'result.append', 'Return one row per school.', { pairs, groups, result })
  return { input: { schools, exam }, result, frames }
}
