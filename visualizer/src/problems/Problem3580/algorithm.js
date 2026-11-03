// Knowledge-derived teaching variant (not the official statement).
const SQL = `WITH ranked AS (
  SELECT r.employee_id, r.review_date, r.rating,
    ROW_NUMBER() OVER (PARTITION BY r.employee_id ORDER BY r.review_date DESC) AS recency
  FROM performance_reviews r
), latest3 AS (
  SELECT employee_id, rating, recency
  FROM ranked
  WHERE recency <= 3
), checked AS (
  SELECT employee_id,
    MAX(CASE WHEN recency = 1 THEN rating END) AS newest,
    MAX(CASE WHEN recency = 2 THEN rating END) AS middle,
    MAX(CASE WHEN recency = 3 THEN rating END) AS oldest
  FROM latest3
  GROUP BY employee_id
  HAVING COUNT(*) = 3
)
SELECT c.employee_id, e.name, c.newest - c.oldest AS improvement
FROM checked c
JOIN employees e ON e.employee_id = c.employee_id
WHERE c.oldest < c.middle AND c.middle < c.newest
ORDER BY improvement DESC, e.name ASC;`

const PYTHON = `def consistently_improving(employees, performance_reviews):
    ordered = performance_reviews.sort_values(['employee_id', 'review_date'], ascending=[True, False])
    latest = ordered.groupby('employee_id').head(3)
    ok = []
    for emp, rows in latest.groupby('employee_id'):
        if len(rows) < 3:
            continue
        ratings = rows.sort_values('review_date').rating.tolist()
        if ratings[0] < ratings[1] < ratings[2]:
            ok.append((emp, ratings[2] - ratings[0]))
    out = pd.DataFrame(ok, columns=['employee_id', 'improvement'])
    out = out.merge(employees[['employee_id', 'name']], on='employee_id')
    return out.sort_values(['improvement', 'name'], ascending=[False, True])`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON
const pyLines = PYTHON.split('\n')

function at(text) {
  const found = code.find(line => line.text.includes(text))
  if (!found) throw new Error(`Missing SQL line: ${text}`)
  return found.line
}

function pyAt(text) {
  const index = pyLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.employees) || !Array.isArray(input.performance_reviews)) {
    throw new Error('Use an object with employees and performance_reviews lists.')
  }
  if (input.employees.length > 8 || input.performance_reviews.length > 24) throw new Error('Use at most 8 employees and 24 reviews.')
  const ids = new Set()
  for (const row of input.employees) {
    if (!Number.isInteger(row.employee_id) || typeof row.name !== 'string') throw new Error('Each employee needs an integer employee_id and a name.')
    ids.add(row.employee_id)
  }
  const dates = new Set()
  for (const row of input.performance_reviews) {
    if (!Number.isInteger(row.review_id) || !ids.has(row.employee_id)) throw new Error('Each review needs an integer review_id and a known employee_id.')
    if (typeof row.review_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.review_date)) throw new Error('review_date must look like YYYY-MM-DD.')
    if (!Number.isInteger(row.rating) || row.rating < 1 || row.rating > 10) throw new Error('rating must be a whole number from 1 to 10.')
    const key = `${row.employee_id}|${row.review_date}`
    if (dates.has(key)) throw new Error('This teaching variant needs distinct review dates for each employee.')
    dates.add(key)
  }
  return {
    employees: input.employees.map(row => ({ ...row })),
    performance_reviews: input.performance_reviews.map(row => ({ ...row })),
  }
}

export function buildTrace(input) {
  const { employees, performance_reviews: reviews } = input
  const nameOf = Object.fromEntries(employees.map(row => [row.employee_id, row.name]))
  const frames = []
  const step = (phase, sqlKey, pyKey, message, rows, result = []) => frames.push({
    phase, activeLine: at(sqlKey), pythonLine: pyAt(pyKey), message,
    rows: rows.map(row => ({ ...row })), result: result.map(row => ({ ...row })),
  })

  step('load', 'FROM performance_reviews r', 'def consistently_improving', `Load ${employees.length} employees and ${reviews.length} reviews.`, reviews)

  const ids = [...new Set(reviews.map(row => row.employee_id))].sort((a, b) => a - b)
  const latestByEmployee = new Map()
  for (const id of ids) {
    const own = reviews.filter(row => row.employee_id === id).sort((a, b) => (a.review_date < b.review_date ? 1 : -1))
    latestByEmployee.set(id, own.slice(0, 3))
    step('group', 'ROW_NUMBER() OVER', 'ordered = ',
      `${nameOf[id]} has ${own.length} review${own.length === 1 ? '' : 's'}, newest first.`, own)
  }

  const result = []
  for (const id of ids) {
    const top = latestByEmployee.get(id)
    if (top.length < 3) {
      step('latest', 'WHERE recency <= 3', 'latest = ', `${nameOf[id]} has fewer than three reviews, so the employee is skipped.`, top, result)
      continue
    }
    step('latest', 'WHERE recency <= 3', 'latest = ', `Take the three newest reviews for ${nameOf[id]}.`, top, result)
    const oldestFirst = top.slice().sort((a, b) => (a.review_date < b.review_date ? -1 : 1)).map(row => row.rating)
    const improving = oldestFirst[0] < oldestFirst[1] && oldestFirst[1] < oldestFirst[2]
    if (improving) result.push({ employee_id: id, name: nameOf[id], improvement: oldestFirst[2] - oldestFirst[0] })
    step('check', 'WHERE c.oldest < c.middle', 'if ratings[0]',
      `${nameOf[id]} rated ${oldestFirst.join(', ')} oldest to newest: ${improving ? 'strictly rising, kept.' : 'not strictly rising.'}`, top, result)
  }

  result.sort((a, b) => b.improvement - a.improvement || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
  step('output', 'ORDER BY improvement DESC', 'return out.sort_values', `Return ${result.length} consistently improving employees.`, reviews, result)
  return { input: { employees, performance_reviews: reviews }, result, frames }
}
