// Knowledge-derived teaching model (not the official statement): per department, keep the employees
// whose salary is the second-highest DISTINCT value. Departments with one distinct salary are omitted.

const SQL_LINES = [
  'WITH ranked AS (',
  '  SELECT emp_id, name, salary, dept,',
  '         DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk',
  '  FROM Employees',
  ')',
  'SELECT emp_id, dept',
  'FROM ranked',
  'WHERE rnk = 2',
  'ORDER BY emp_id;',
]

const PY_LINES = [
  'def second_highest_per_dept(employees):',
  '    df = pd.DataFrame(employees)',
  "    df['rnk'] = df.groupby('dept')['salary'].rank(method='dense', ascending=False)",
  "    picked = df[df['rnk'] == 2]",
  "    picked = picked.sort_values('emp_id')",
  "    return picked[['emp_id', 'dept']].to_dict('records')",
]

export const sql = SQL_LINES.join('\n')
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

export const phases = [
  { id: 'load', label: 'Load', description: 'Read every employee row.' },
  { id: 'rank', label: 'Rank', description: 'Dense-rank salaries inside each department.' },
  { id: 'filter', label: 'Filter', description: 'Keep rank 2 only.' },
  { id: 'order', label: 'Order', description: 'Sort the kept rows by emp_id.' },
  { id: 'output', label: 'Result', description: 'Show the result rows.' },
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
  if (!input || !Array.isArray(input.employees)) throw new Error('Use an object with an employees array.')
  if (input.employees.length > 12) throw new Error('Use at most 12 employees for the teaching view.')
  const ids = new Set()
  for (const row of input.employees) {
    if (!Number.isInteger(row.emp_id) || ids.has(row.emp_id)) throw new Error('Each emp_id must be a unique integer.')
    ids.add(row.emp_id)
    if (typeof row.name !== 'string' || typeof row.dept !== 'string') throw new Error('name and dept are text.')
    if (!Number.isInteger(row.salary) || row.salary < 0) throw new Error('salary is a non-negative integer.')
  }
  return { employees: input.employees.map(row => ({ ...row })) }
}

export function buildTrace({ employees }) {
  const frames = []
  const snap = rows => rows.map(row => ({ ...row }))
  frames.push({ phase: 'load', activeLine: sqlAt('FROM Employees'), pythonLine: pyAt('DataFrame'), message: `Loaded ${employees.length} employees.`, rows: snap(employees) })

  // Dense rank: equal salaries share a rank and the next distinct salary gets the next rank.
  const ranked = employees.map(row => ({ ...row }))
  for (const dept of [...new Set(ranked.map(row => row.dept))]) {
    const members = ranked.filter(row => row.dept === dept)
    const distinct = [...new Set(members.map(row => row.salary))].sort((a, b) => b - a)
    for (const row of members) row.rnk = distinct.indexOf(row.salary) + 1
    frames.push({ phase: 'rank', activeLine: sqlAt('DENSE_RANK'), pythonLine: pyAt('rank(method'), message: `${dept}: distinct salaries ${distinct.join(', ')}.`, rows: snap(ranked) })
  }

  const kept = ranked.filter(row => row.rnk === 2)
  const dropped = [...new Set(ranked.map(row => row.dept))].filter(dept => !kept.some(row => row.dept === dept))
  frames.push({ phase: 'filter', activeLine: sqlAt('WHERE rnk'), pythonLine: pyAt("df['rnk'] == 2"), message: `Kept ${kept.length} rows at rank 2${dropped.length ? `; ${dropped.join(', ')} has no second distinct salary` : ''}.`, rows: snap(kept) })

  const sorted = [...kept].sort((a, b) => a.emp_id - b.emp_id)
  frames.push({ phase: 'order', activeLine: sqlAt('ORDER BY'), pythonLine: pyAt('sort_values'), message: 'Sort by emp_id.', rows: snap(sorted) })

  const result = sorted.map(({ emp_id, dept }) => ({ emp_id, dept }))
  frames.push({ phase: 'output', activeLine: sqlAt('ORDER BY emp_id;'), pythonLine: pyAt('return picked'), message: `Result has ${result.length} row${result.length === 1 ? '' : 's'}.`, rows: snap(result), result: true })
  return { input: { employees }, result, frames }
}
