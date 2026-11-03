// Knowledge-derived draft: the rule is the author's own reading of the table task, not copied from an official statement.
// Rule: two meetings of one employee overlap when they share time (start < other end and other start < end).
// An employee is overbooked when the number of overlapping pairs reaches the threshold.
const numbered = list => list.map((text, index) => ({ line: index + 1, text }))
const COLS = ['employee_id', 'name', 'overlaps']
const PAIR_COLS = ['pair', 'overlap']

export const code = numbered([
  'WITH pairs AS (',
  '  SELECT a.employee_id, COUNT(*) AS overlaps',
  '  FROM meetings a JOIN meetings b',
  '    ON a.employee_id = b.employee_id AND a.meeting_id < b.meeting_id',
  '   AND a.start_hour < b.end_hour AND b.start_hour < a.end_hour',
  '  GROUP BY a.employee_id',
  ')',
  'SELECT e.employee_id, e.name, p.overlaps',
  'FROM pairs p JOIN employees e USING (employee_id)',
  'WHERE p.overlaps >= :threshold',
  'ORDER BY p.overlaps DESC, e.name',
])

export const python = `import pandas as pd
def overbooked(employees, meetings, threshold):
    m = meetings.merge(meetings, on="employee_id", suffixes=("", "_b"))
    m = m[(m.meeting_id < m.meeting_id_b) & (m.start_hour < m.end_hour_b) & (m.start_hour_b < m.end_hour)]
    counts = m.groupby("employee_id").size().rename("overlaps").reset_index()
    out = counts[counts.overlaps >= threshold].merge(employees, on="employee_id")
    out = out.sort_values(["overlaps", "name"], ascending=[False, True])
    return out[["employee_id", "name", "overlaps"]]
`

const pyLines = numbered(python.split('\n'))

export const SAMPLE_TEXT = '{"threshold":2,"employees":[{"employee_id":1,"name":"Ana"},{"employee_id":2,"name":"Ben"},{"employee_id":3,"name":"Cleo"},{"employee_id":4,"name":"Dee"}],"meetings":[{"meeting_id":1,"employee_id":1,"start_hour":9,"end_hour":11},{"meeting_id":2,"employee_id":1,"start_hour":10,"end_hour":12},{"meeting_id":3,"employee_id":1,"start_hour":11,"end_hour":13},{"meeting_id":4,"employee_id":2,"start_hour":9,"end_hour":10},{"meeting_id":5,"employee_id":2,"start_hour":10,"end_hour":11},{"meeting_id":6,"employee_id":3,"start_hour":13,"end_hour":15},{"meeting_id":7,"employee_id":3,"start_hour":14,"end_hour":16},{"meeting_id":8,"employee_id":3,"start_hour":15,"end_hour":17},{"meeting_id":9,"employee_id":4,"start_hour":8,"end_hour":12},{"meeting_id":10,"employee_id":4,"start_hour":9,"end_hour":10},{"meeting_id":11,"employee_id":4,"start_hour":9,"end_hour":11}]}'

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
  if (!input || !Array.isArray(input.employees) || !Array.isArray(input.meetings) || !Number.isInteger(input.threshold) || input.threshold < 1) {
    throw new Error('Use employees, meetings and a whole-number threshold of at least 1.')
  }
  for (const m of input.meetings) {
    if (!(m.start_hour < m.end_hour)) throw new Error('Each meeting must end after it starts.')
  }
  return input
}

export function buildTrace(input) {
  const { employees, meetings, threshold } = input
  const frames = [frame('load', 'WITH pairs AS (', 'def overbooked', `Load ${meetings.length} meetings. Threshold is ${threshold}.`, ['meeting_id', 'employee_id', 'start_hour', 'end_hour'], meetings)]
  const found = []
  for (const e of employees) {
    const mine = meetings.filter(m => m.employee_id === e.employee_id)
    const comparisons = []
    let overlaps = 0
    for (let i = 0; i < mine.length; i++) {
      for (let j = i + 1; j < mine.length; j++) {
        const a = mine[i]
        const b = mine[j]
        const hit = a.start_hour < b.end_hour && b.start_hour < a.end_hour
        if (hit) overlaps++
        comparisons.push({ pair: `${a.meeting_id} and ${b.meeting_id}`, overlap: hit ? 'yes' : 'no' })
        frames.push(frame('compare', 'AND a.start_hour < b.end_hour', 'm.start_hour < m.end_hour_b', `${e.name}: meetings ${a.meeting_id} and ${b.meeting_id} ${hit ? 'overlap' : 'do not overlap'}.`, PAIR_COLS, comparisons))
      }
    }
    frames.push(frame('count', 'COUNT(*) AS overlaps', 'size().rename("overlaps")', `${e.name} has ${overlaps} overlapping pair(s).`, PAIR_COLS, comparisons))
    if (overlaps >= threshold) {
      found.push({ employee_id: e.employee_id, name: e.name, overlaps })
      frames.push(frame('flag', 'WHERE p.overlaps >= :threshold', 'counts.overlaps >= threshold', `${e.name} is overbooked.`, COLS, found))
    } else {
      frames.push(frame('skip', 'WHERE p.overlaps >= :threshold', 'counts.overlaps >= threshold', `${e.name} stays below the threshold.`, COLS, found))
    }
  }
  const rows = [...found].sort((a, b) => b.overlaps - a.overlaps || a.name.localeCompare(b.name))
  frames.push(frame('order', 'ORDER BY p.overlaps DESC', 'sort_values', 'Sort by overlaps, then by name.', COLS, rows))
  frames.push(frame('done', 'SELECT e.employee_id, e.name', 'return out[["employee_id"', `Result has ${rows.length} row(s).`, COLS, rows))
  return { input: { employees, meetings, threshold }, result: rows, frames }
}
