// Knowledge-derived teaching model. The SQL, pandas code, sample rows and wording are written for this visualizer.
const COLUMNS = ['user_id', 'course_id', 'course_name', 'completion_date', 'course_rating']
const PAIR_COLUMNS = ['first_course', 'second_course', 'transition_count']
const DATE = /^\d{4}-\d{2}-\d{2}$/

export const sql = `-- course names taken back to back by well-rated, active users
WITH qualifying AS (
  SELECT user_id FROM course_completions
  GROUP BY user_id
  HAVING COUNT(*) >= 5 AND AVG(course_rating) >= 4
),
following AS (
  SELECT course_name,
    LEAD(course_name) OVER (PARTITION BY user_id ORDER BY completion_date) AS next_course
  FROM course_completions
  WHERE user_id IN (SELECT user_id FROM qualifying)
)
SELECT course_name AS first_course, next_course AS second_course, COUNT(*) AS transition_count
FROM following
WHERE next_course IS NOT NULL
GROUP BY course_name, next_course
ORDER BY transition_count DESC, first_course, second_course;`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def most_common_course_pairs(course_completions):
    df = course_completions.copy()
    stats = df.groupby('user_id')['course_rating'].agg(['count', 'mean'])
    keep = stats[(stats['count'] >= 5) & (stats['mean'] >= 4)].index
    df = df[df['user_id'].isin(keep)].sort_values(['user_id', 'completion_date'])
    df['second_course'] = df.groupby('user_id')['course_name'].shift(-1)
    pairs = df.dropna(subset=['second_course'])
    out = pairs.groupby(['course_name', 'second_course']).size().reset_index(name='transition_count')
    out = out.rename(columns={'course_name': 'first_course'})
    out = out.sort_values(['transition_count', 'first_course', 'second_course'], ascending=[False, True, True])
    return out[['first_course', 'second_course', 'transition_count']]
`

const SQL_LINE = text => {
  const hit = code.find(line => line.text.includes(text))
  if (!hit) throw new Error(`Missing SQL line: ${text}`)
  return hit.line
}
const PY_LINE = text => {
  const hit = python.split('\n').findIndex(line => line.includes(text))
  if (hit < 0) throw new Error(`Missing Python line: ${text}`)
  return hit + 1
}
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

export const phases = [
  { id: 'load', label: 'Load', description: 'The completion rows as stored.' },
  { id: 'filter', label: 'Filter users', description: 'Keep users with at least five courses and a mean rating of four or more.' },
  { id: 'order', label: 'Order', description: 'Sort each kept user\'s completions by date.' },
  { id: 'pair', label: 'Pairs', description: 'Count each back-to-back course name pair.' },
  { id: 'sort', label: 'Sort', description: 'Order pairs by count, then both names.' },
  { id: 'done', label: 'Output', description: 'The report table.' },
]

export const inputLabel = 'Object with a course_completions list (user_id, course_id, course_name, completion_date, course_rating)'
export const complexity = 'O(r log r) for r completion rows, plus the pair counting. The visualizer caps the table at 30 rows and asks for one completion per user per day.'
export const examples = [
  {
    label: 'Two qualifying users',
    input: JSON.stringify({
      course_completions: [
        { user_id: 1, course_id: 101, course_name: 'Python', completion_date: '2026-01-05', course_rating: 5 },
        { user_id: 1, course_id: 102, course_name: 'SQL', completion_date: '2026-01-10', course_rating: 4 },
        { user_id: 1, course_id: 103, course_name: 'Stats', completion_date: '2026-01-20', course_rating: 4 },
        { user_id: 1, course_id: 104, course_name: 'ML', completion_date: '2026-02-01', course_rating: 5 },
        { user_id: 1, course_id: 105, course_name: 'Viz', completion_date: '2026-02-15', course_rating: 4 },
        { user_id: 2, course_id: 201, course_name: 'SQL', completion_date: '2026-01-03', course_rating: 3 },
        { user_id: 2, course_id: 202, course_name: 'Python', completion_date: '2026-01-07', course_rating: 3 },
        { user_id: 2, course_id: 203, course_name: 'Stats', completion_date: '2026-01-09', course_rating: 4 },
        { user_id: 2, course_id: 204, course_name: 'ML', completion_date: '2026-01-12', course_rating: 3 },
        { user_id: 2, course_id: 205, course_name: 'Viz', completion_date: '2026-01-30', course_rating: 3 },
        { user_id: 3, course_id: 301, course_name: 'Python', completion_date: '2026-02-01', course_rating: 4 },
        { user_id: 3, course_id: 302, course_name: 'SQL', completion_date: '2026-02-03', course_rating: 4 },
        { user_id: 3, course_id: 303, course_name: 'Stats', completion_date: '2026-02-08', course_rating: 4 },
        { user_id: 3, course_id: 304, course_name: 'ML', completion_date: '2026-02-09', course_rating: 5 },
        { user_id: 3, course_id: 305, course_name: 'Viz', completion_date: '2026-02-20', course_rating: 5 },
        { user_id: 4, course_id: 401, course_name: 'Python', completion_date: '2026-03-01', course_rating: 5 },
        { user_id: 4, course_id: 402, course_name: 'SQL', completion_date: '2026-03-02', course_rating: 5 },
        { user_id: 4, course_id: 403, course_name: 'Stats', completion_date: '2026-03-03', course_rating: 5 },
        { user_id: 4, course_id: 404, course_name: 'ML', completion_date: '2026-03-04', course_rating: 5 },
        { user_id: 5, course_id: 501, course_name: 'SQL', completion_date: '2026-03-01', course_rating: 4 },
        { user_id: 5, course_id: 502, course_name: 'Stats', completion_date: '2026-03-02', course_rating: 4 },
        { user_id: 5, course_id: 503, course_name: 'ML', completion_date: '2026-03-03', course_rating: 4 },
        { user_id: 5, course_id: 504, course_name: 'Viz', completion_date: '2026-03-04', course_rating: 4 },
        { user_id: 5, course_id: 505, course_name: 'Python', completion_date: '2026-03-05', course_rating: 4 },
      ],
    }),
  },
  {
    label: 'Nobody qualifies',
    input: JSON.stringify({
      course_completions: [
        { user_id: 7, course_id: 701, course_name: 'Go', completion_date: '2026-04-01', course_rating: 2 },
        { user_id: 7, course_id: 702, course_name: 'Rust', completion_date: '2026-04-02', course_rating: 3 },
      ],
    }),
  },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.course_completions)) throw new Error('Use an object with a course_completions list.')
  const rows = input.course_completions
  if (rows.length < 1 || rows.length > 30) throw new Error('Use 1 to 30 completion rows.')
  const courses = new Set()
  const days = new Set()
  for (const r of rows) {
    if (!Number.isInteger(r.user_id) || !Number.isInteger(r.course_id)) throw new Error('user_id and course_id are integers.')
    if (typeof r.course_name !== 'string' || r.course_name.trim() === '') throw new Error('course_name is non-empty text.')
    if (typeof r.completion_date !== 'string' || !DATE.test(r.completion_date)) throw new Error('completion_date uses YYYY-MM-DD.')
    if (!Number.isInteger(r.course_rating) || r.course_rating < 1 || r.course_rating > 5) throw new Error('course_rating is an integer from 1 to 5.')
    const course = `${r.user_id}/${r.course_id}`
    if (courses.has(course)) throw new Error('Each user and course pair appears once.')
    courses.add(course)
    // Same-day order is not settled by the source notes, so this model refuses ties instead of guessing.
    const day = `${r.user_id}/${r.completion_date}`
    if (days.has(day)) throw new Error('Use one completion per user per day; same-day order is not settled.')
    days.add(day)
  }
  return { course_completions: rows.map(r => ({ ...r })) }
}

export function buildTrace(input) {
  const rows = input.course_completions
  const frames = []
  const add = (phase, sqlKey, pyKey, message, columns, table) => frames.push({
    phase, activeLine: SQL_LINE(sqlKey), pythonLine: PY_LINE(pyKey), message, columns,
    rows: table.map(row => ({ ...row })),
  })

  add('load', 'FROM course_completions', 'copy()', 'Load every completion row.', COLUMNS, rows)

  const userIds = [...new Set(rows.map(r => r.user_id))].sort((a, b) => a - b)
  const qualifying = []
  let kept = []
  for (const id of userIds) {
    const mine = rows.filter(r => r.user_id === id)
    const total = mine.reduce((sum, r) => sum + r.course_rating, 0)
    const ok = mine.length >= 5 && total >= 4 * mine.length
    if (ok) {
      qualifying.push(id)
      kept = kept.concat(mine)
    }
    add('filter', 'HAVING', 'keep = stats', `User ${id}: ${mine.length} courses, mean ${(total / mine.length).toFixed(2)}. ${ok ? 'Keep.' : 'Drop.'}`, COLUMNS, kept)
  }

  const sequences = new Map()
  let ordered = []
  for (const id of qualifying) {
    const seq = rows.filter(r => r.user_id === id).sort((a, b) => cmp(a.completion_date, b.completion_date))
    sequences.set(id, seq)
    ordered = ordered.concat(seq)
    add('order', 'PARTITION BY', "sort_values(['user_id'", `User ${id}: completions in date order.`, COLUMNS, ordered)
  }

  const counts = new Map()
  for (const id of qualifying) {
    const seq = sequences.get(id)
    for (let i = 0; i + 1 < seq.length; i++) {
      const first = seq[i].course_name
      const second = seq[i + 1].course_name
      const key = `${first}\u0000${second}`
      const entry = counts.get(key) ?? { first_course: first, second_course: second, transition_count: 0 }
      entry.transition_count += 1
      counts.set(key, entry)
      const table = [...counts.values()]
      add('pair', 'GROUP BY course_name', 'shift(-1)', `User ${id}: ${first} then ${second}; count ${entry.transition_count}.`, PAIR_COLUMNS, table)
    }
  }

  const result = [...counts.values()]
    .map(p => ({ ...p }))
    .sort((a, b) => b.transition_count - a.transition_count || cmp(a.first_course, b.first_course) || cmp(a.second_course, b.second_course))
  add('sort', 'ORDER BY', "sort_values(['transition_count'", 'Order by count descending, then both names ascending.', PAIR_COLUMNS, result)
  add('done', 'SELECT course_name AS first_course', 'return out[', `Report ${result.length} pair${result.length === 1 ? '' : 's'}.`, PAIR_COLUMNS, result)
  return { input: { course_completions: rows }, result, frames }
}
