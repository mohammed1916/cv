// Knowledge-derived teaching model (not the official statement): for each student and subject with at least two
// different exam dates, compare the score on the earliest date with the score on the latest date. Keep the pairs
// where the latest score is strictly higher. Output column names and order are this teaching version's choices.

const SQL_LINES = [
  'WITH bounds AS (',
  '  SELECT student_id, subject,',
  '         MIN(exam_date) AS first_date, MAX(exam_date) AS last_date,',
  '         COUNT(DISTINCT exam_date) AS exams',
  '  FROM Scores GROUP BY student_id, subject',
  ')',
  'SELECT b.student_id, b.subject, f.score AS first_score, l.score AS latest_score',
  'FROM bounds b',
  'JOIN Scores f ON f.student_id = b.student_id AND f.subject = b.subject AND f.exam_date = b.first_date',
  'JOIN Scores l ON l.student_id = b.student_id AND l.subject = b.subject AND l.exam_date = b.last_date',
  'WHERE b.exams >= 2 AND l.score > f.score',
  'ORDER BY b.student_id, b.subject;',
]

const PY_LINES = [
  'def students_who_improved(scores):',
  '    df = pd.DataFrame(scores).sort_values(["student_id", "subject", "exam_date"])',
  '    grouped = df.groupby(["student_id", "subject"])',
  '    summary = grouped.agg(exams=("exam_date", "nunique"), first_score=("score", "first"), latest_score=("score", "last"))',
  '    summary = summary[(summary["exams"] >= 2) & (summary["latest_score"] > summary["first_score"])]',
  '    return summary.reset_index().to_dict("records")',
]

export const sql = SQL_LINES.join('\n')
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

export const phases = [
  { id: 'load', label: 'Load', description: 'Read every score row.' },
  { id: 'group', label: 'Group', description: 'Find the first and latest exam in each student and subject pair.' },
  { id: 'compare', label: 'Compare', description: 'Keep pairs with at least two exams and a higher latest score.' },
  { id: 'order', label: 'Order', description: 'Sort by student_id and subject.' },
  { id: 'output', label: 'Result', description: 'Show the improved students.' },
]

function lineOf(lines, fragment) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}
const sqlAt = fragment => lineOf(SQL_LINES, fragment)
const pyAt = fragment => lineOf(PY_LINES, fragment)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.scores)) throw new Error('Use an object with a scores array.')
  if (input.scores.length > 16) throw new Error('Use at most 16 score rows for the teaching view.')
  const keys = new Set()
  for (const row of input.scores) {
    if (!Number.isInteger(row.student_id)) throw new Error('student_id is an integer.')
    if (typeof row.subject !== 'string' || !/^[A-Za-z]{1,12}$/.test(row.subject)) throw new Error('subject is 1 to 12 letters.')
    if (!Number.isInteger(row.score) || row.score < 0 || row.score > 100) throw new Error('score is an integer from 0 to 100.')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.exam_date)) throw new Error('exam_date uses YYYY-MM-DD.')
    const key = `${row.student_id}|${row.subject}|${row.exam_date}`
    if (keys.has(key)) throw new Error('Each student, subject and exam_date appears once.')
    keys.add(key)
  }
  return { scores: input.scores.map(row => ({ ...row })) }
}

export function buildTrace({ scores }) {
  const frames = []
  const snap = rows => rows.map(row => ({ ...row }))
  frames.push({ phase: 'load', activeLine: sqlAt('FROM Scores GROUP'), pythonLine: pyAt('DataFrame'), message: `Loaded ${scores.length} score rows.`, rows: snap(scores) })

  const groups = new Map()
  for (const row of scores) {
    const key = `${row.student_id}|${row.subject}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }
  const summaries = []
  for (const [, rows] of groups) {
    const ordered = [...rows].sort((a, b) => (a.exam_date < b.exam_date ? -1 : a.exam_date > b.exam_date ? 1 : 0))
    const first = ordered[0]
    const latest = ordered.at(-1)
    const summary = {
      student_id: first.student_id, subject: first.subject,
      exams: new Set(rows.map(row => row.exam_date)).size,
      first_score: first.score, latest_score: latest.score,
    }
    summaries.push(summary)
    frames.push({ phase: 'group', activeLine: sqlAt('MIN(exam_date)'), pythonLine: pyAt('groupby'), message: `Student ${summary.student_id} ${summary.subject}: ${summary.exams} exam date${summary.exams === 1 ? '' : 's'}, first ${summary.first_score}, latest ${summary.latest_score}.`, rows: snap(summaries) })
  }

  const kept = []
  for (const summary of summaries) {
    const improved = summary.exams >= 2 && summary.latest_score > summary.first_score
    if (improved) kept.push(summary)
    frames.push({
      phase: 'compare', activeLine: sqlAt('WHERE b.exams'), pythonLine: pyAt('summary = summary[('),
      message: improved ? `Student ${summary.student_id} ${summary.subject} improved.` : `Student ${summary.student_id} ${summary.subject} does not qualify.`,
      rows: snap(kept),
    })
  }

  const sorted = [...kept].sort((a, b) => a.student_id - b.student_id || a.subject.localeCompare(b.subject))
  frames.push({ phase: 'order', activeLine: sqlAt('ORDER BY'), pythonLine: pyAt('reset_index'), message: 'Sort by student_id, then subject.', rows: snap(sorted) })
  const result = sorted.map(({ student_id, subject, first_score, latest_score }) => ({ student_id, subject, first_score, latest_score }))
  frames.push({ phase: 'output', activeLine: sqlAt('SELECT b.student_id'), pythonLine: pyAt('return summary'), message: `Result has ${result.length} improved pair${result.length === 1 ? '' : 's'}.`, rows: snap(result), result: true })
  return { input: { scores }, result, frames }
}
