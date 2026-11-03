// Knowledge-derived draft: the rule is the author's own reading of the table task, not copied from an official statement.
// Rule: within one student's sessions (sorted by date), a session is a hit when its subject equals the subject three
// sessions earlier. The spiral length is the longest run of consecutive hits plus the three base sessions.
// A student is reported when the spiral length reaches min_length.
const numbered = list => list.map((text, index) => ({ line: index + 1, text }))
const COLS = ['student_id', 'spiral_length']
const MARK_COLS = ['study_date', 'subject', 'hit']

export const code = numbered([
  'WITH marked AS (',
  '  SELECT student_id, study_date, subject,',
  '    subject = LAG(subject, 3) OVER (PARTITION BY student_id ORDER BY study_date) AS hit',
  '  FROM sessions',
  '), islands AS (',
  '  SELECT student_id, study_date, hit,',
  '    ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY study_date)',
  '      - ROW_NUMBER() OVER (PARTITION BY student_id, hit ORDER BY study_date) AS island',
  '  FROM marked',
  '), best AS (',
  '  SELECT student_id, MAX(run) + 3 AS spiral_length FROM (',
  '    SELECT student_id, COUNT(*) AS run FROM islands WHERE hit GROUP BY student_id, island',
  '  ) runs GROUP BY student_id',
  ')',
  'SELECT student_id, spiral_length FROM best',
  'WHERE spiral_length >= :min_length ORDER BY spiral_length DESC, student_id',
])

export const python = `import pandas as pd
def spiral_students(sessions, min_length):
    s = sessions.sort_values(["student_id", "study_date"]).copy()
    s["prev3"] = s.groupby("student_id").subject.shift(3)
    s["hit"] = s.subject == s.prev3
    s["island"] = (s.hit != s.groupby("student_id").hit.shift()).cumsum()
    runs = s[s.hit].groupby(["student_id", "island"]).size()
    best = (runs.groupby("student_id").max() + 3).rename("spiral_length").reset_index()
    out = best[best.spiral_length >= min_length]
    return out.sort_values(["spiral_length", "student_id"], ascending=[False, True])
`

const pyLines = numbered(python.split('\n'))

export const SAMPLE_TEXT = '{"min_length":6,"sessions":[{"session_id":1,"student_id":1,"study_date":"2024-03-01","subject":"Math"},{"session_id":2,"student_id":1,"study_date":"2024-03-02","subject":"Science"},{"session_id":3,"student_id":1,"study_date":"2024-03-03","subject":"History"},{"session_id":4,"student_id":1,"study_date":"2024-03-04","subject":"Math"},{"session_id":5,"student_id":1,"study_date":"2024-03-05","subject":"Science"},{"session_id":6,"student_id":1,"study_date":"2024-03-06","subject":"History"},{"session_id":7,"student_id":1,"study_date":"2024-03-07","subject":"Math"},{"session_id":8,"student_id":1,"study_date":"2024-03-08","subject":"Science"},{"session_id":9,"student_id":2,"study_date":"2024-03-02","subject":"Math"},{"session_id":10,"student_id":2,"study_date":"2024-03-03","subject":"Science"},{"session_id":11,"student_id":2,"study_date":"2024-03-04","subject":"History"},{"session_id":12,"student_id":2,"study_date":"2024-03-05","subject":"Math"},{"session_id":13,"student_id":2,"study_date":"2024-03-06","subject":"History"},{"session_id":14,"student_id":2,"study_date":"2024-03-07","subject":"Science"},{"session_id":15,"student_id":3,"study_date":"2024-03-01","subject":"History"},{"session_id":16,"student_id":3,"study_date":"2024-03-02","subject":"Math"},{"session_id":17,"student_id":3,"study_date":"2024-03-03","subject":"Science"},{"session_id":18,"student_id":3,"study_date":"2024-03-04","subject":"History"},{"session_id":19,"student_id":3,"study_date":"2024-03-05","subject":"Math"},{"session_id":20,"student_id":3,"study_date":"2024-03-06","subject":"Science"}]}'

function lineOf(list, fragment, label) {
  const hit = list.find(row => row.text.includes(fragment))
  if (!hit) throw new Error(`${label} line missing: ${fragment}`)
  return hit.line
}

function frame(phase, sql, py, message, columns, rows) {
  return { phase, activeLine: lineOf(code, sql, 'SQL'), pythonLine: lineOf(pyLines, py, 'Python'), message, columns, rows: rows.map(row => ({ ...row })) }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.sessions) || !Number.isInteger(input.min_length) || input.min_length < 3) {
    throw new Error('Use a sessions list and a whole-number min_length of at least 3.')
  }
  for (const s of input.sessions) {
    if (typeof s.subject !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s.study_date)) throw new Error('Each session needs a subject and an ISO date.')
  }
  return input
}

export function buildTrace(input) {
  const { sessions, min_length: minLength } = input
  const frames = [frame('load', 'WITH marked AS (', 'def spiral_students', `Load ${sessions.length} study sessions.`, ['session_id', 'student_id', 'study_date', 'subject'], sessions)]
  const students = [...new Set(sessions.map(s => s.student_id))].sort((a, b) => a - b)
  const found = []
  for (const id of students) {
    const mine = sessions.filter(s => s.student_id === id).sort((a, b) => (a.study_date < b.study_date ? -1 : 1))
    const marks = mine.map((s, k) => ({ study_date: s.study_date, subject: s.subject, hit: k < 3 ? 'n/a' : (s.subject === mine[k - 3].subject ? 'yes' : 'no') }))
    let current = 0
    let best = 0
    for (let k = 3; k < mine.length; k++) {
      if (mine[k].subject === mine[k - 3].subject) {
        current++
        best = Math.max(best, current + 3)
      } else {
        current = 0
      }
    }
    frames.push(frame('mark', 'subject = LAG(subject, 3)', 's["hit"] = s.subject == s.prev3', `Student ${id}: marks show repeats every three sessions.`, MARK_COLS, marks))
    if (best >= minLength) {
      found.push({ student_id: id, spiral_length: best })
      frames.push(frame('keep', 'WHERE spiral_length >= :min_length', 'out = best[best.spiral_length >= min_length]', `Student ${id} has a spiral of ${best} sessions.`, COLS, found))
    } else {
      frames.push(frame('skip', 'WHERE spiral_length >= :min_length', 'out = best[best.spiral_length >= min_length]', `Student ${id} best spiral is ${best}, below ${minLength}.`, COLS, found))
    }
  }
  const rows = [...found].sort((a, b) => b.spiral_length - a.spiral_length || a.student_id - b.student_id)
  frames.push(frame('order', 'ORDER BY spiral_length DESC', 'ascending=[False, True]', 'Sort by spiral length, then by student.', COLS, rows))
  frames.push(frame('done', 'SELECT student_id, spiral_length FROM best', 'return out.sort_values', `Result has ${rows.length} row(s).`, COLS, rows))
  return { input: { sessions, min_length: minLength }, result: rows, frames }
}
