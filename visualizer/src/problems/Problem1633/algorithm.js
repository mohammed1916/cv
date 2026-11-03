// Knowledge-derived SQL lesson. The sample tables are invented for this visualization.
export const sql = `select r.contest_id,
       round(count(distinct r.user_id) * 100.0 / (select count(*) from Users), 2) as percentage
from Register r
group by r.contest_id
order by percentage desc, r.contest_id`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def attendance(users, register):
    total = len(users)
    counts = register.groupby('contest_id')['user_id'].nunique().reset_index(name='attendees')
    counts['percentage'] = (counts['attendees'] * 100 / total).round(2)
    return counts[['contest_id', 'percentage']].sort_values(['percentage', 'contest_id'], ascending=[False, True])`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Register rows.' },
  { id: 'count', label: 'Count', description: 'Count distinct users registered for each contest.' },
  { id: 'percent', label: 'Percent', description: 'Divide by the total number of users and round.' },
  { id: 'order', label: 'Order', description: 'Sort by percentage descending, then contest id.' },
  { id: 'done', label: 'Result', description: 'Report each contest percentage.' },
]

const sqlLine = text => {
  const hit = code.find(c => c.text.includes(text))
  if (!hit) throw new Error(`No SQL line contains "${text}".`)
  return hit.line
}
const pyLine = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains "${text}".`)
  return index + 1
}
const frame = (phase, sqlText, pyText, rows, output, message) => ({
  phase, activeLine: sqlLine(sqlText), pythonLine: pyLine(pyText),
  rows: rows.map(row => ({ ...row })), output: output.map(row => ({ ...row })), message,
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with users and register lists.')
  if (!Array.isArray(input.users) || input.users.length < 1 || input.users.length > 10) throw new Error('users is a list of 1 to 10 rows.')
  if (!Array.isArray(input.register) || input.register.length > 30) throw new Error('register is a list of at most 30 rows.')
  for (const u of input.users) {
    if (typeof u.user_id !== 'number' || typeof u.user_name !== 'string') throw new Error('Each user has user_id and user_name.')
  }
  for (const r of input.register) {
    if (typeof r.contest_id !== 'number' || typeof r.user_id !== 'number') throw new Error('Each registration has contest_id and user_id.')
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const register = input.register.map(r => ({ ...r }))
  frames.push(frame('load', 'from Register r', 'def attendance', register, [], `Read ${register.length} registrations.`))
  const people = new Map()
  for (const r of register) {
    const set = people.get(r.contest_id) ?? new Set()
    set.add(r.user_id)
    people.set(r.contest_id, set)
  }
  const total = input.users.length
  const counted = [...people.entries()].map(([contest_id, set]) => ({ contest_id, attendees: set.size }))
  frames.push(frame('count', 'count(distinct r.user_id)', "groupby('contest_id')", counted, [], `Counted ${counted.length} contests.`))
  const percent = counted.map(c => ({ contest_id: c.contest_id, attendees: c.attendees, percentage: Math.round((c.attendees * 100 / total) * 100) / 100 }))
  frames.push(frame('percent', 'round(count(distinct', "counts['percentage']", percent, [], `Divide by ${total} users and round to two decimals.`))
  const ordered = [...percent].sort((a, b) => b.percentage - a.percentage || a.contest_id - b.contest_id)
  frames.push(frame('order', 'order by percentage desc', "sort_values(['percentage', 'contest_id']", ordered, [], 'Sort by percentage descending, then contest id.'))
  const result = ordered.map(p => ({ contest_id: p.contest_id, percentage: p.percentage }))
  frames.push(frame('done', 'select r.contest_id', 'return counts', result, result, `Returned ${result.length} contests.`))
  return { input, result, frames }
}
