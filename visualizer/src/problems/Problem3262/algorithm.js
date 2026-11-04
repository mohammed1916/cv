// Knowledge-derived teaching model written for this visualizer. Not the official statement text.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the shift table.' },
  { id: 'pair', label: 'Pair', description: 'Pair a shift with a later shift of the same employee.' },
  { id: 'overlap', label: 'Overlap', description: 'The two shifts share at least one minute.' },
  { id: 'apart', label: 'Apart', description: 'The shifts are apart or only touch at an endpoint.' },
  { id: 'output', label: 'Result', description: 'Return one row per employee with overlaps.' },
]

export const code = `SELECT a.employee_id, COUNT(*) AS overlapping_shifts
FROM EmployeeShifts a
JOIN EmployeeShifts b
  ON a.employee_id = b.employee_id AND a.shift_id < b.shift_id
WHERE a.start_time < b.end_time AND b.start_time < a.end_time
GROUP BY a.employee_id
ORDER BY a.employee_id`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def overlapping_shifts(df):
    pairs = df.merge(df, on='employee_id', suffixes=('_a', '_b'))
    pairs = pairs[pairs.shift_id_a < pairs.shift_id_b]
    hit = pairs[(pairs.start_time_a < pairs.end_time_b) & (pairs.start_time_b < pairs.end_time_a)]
    out = hit.groupby('employee_id').size().reset_index(name='overlapping_shifts')
    return out.sort_values('employee_id')
`

const lookupCode = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`No SQL line contains: ${text}`)
  return index + 1
}
const lookupPython = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.EmployeeShifts)) throw new Error('Use an object with an EmployeeShifts list.')
  if (input.EmployeeShifts.length > 12) throw new Error('Use at most 12 shifts so each step stays readable.')
  const ids = new Set()
  for (const row of input.EmployeeShifts) {
    if (!Number.isInteger(row.shift_id) || !Number.isInteger(row.employee_id)) throw new Error('shift_id and employee_id must be integers.')
    if (ids.has(row.shift_id)) throw new Error('shift_id values must be unique.')
    ids.add(row.shift_id)
    if (!Number.isInteger(row.start_time) || !Number.isInteger(row.end_time) || row.start_time < 0 || row.start_time >= row.end_time) {
      throw new Error('Each shift needs whole-minute start_time before end_time.')
    }
  }
  return input
}

export function buildTrace(input) {
  const shifts = [...input.EmployeeShifts].sort((a, b) => a.shift_id - b.shift_id)
  const counts = new Map()
  const rows = () => [...counts].filter(([, n]) => n > 0).sort(([a], [b]) => a - b)
    .map(([employee_id, overlapping_shifts]) => ({ employee_id, overlapping_shifts }))
  const frames = []
  let pair = null
  const push = (phase, sqlText, pyText, message) => frames.push({
    phase, activeLine: lookupCode(sqlText), pythonLine: lookupPython(pyText), message, rows: rows(), pair,
  })
  push('load', 'FROM EmployeeShifts a', 'df.merge', `Load ${shifts.length} shifts and pair each shift with every later shift.`)
  for (let i = 0; i < shifts.length; i++) {
    for (let j = i + 1; j < shifts.length; j++) {
      const a = shifts[i]
      const b = shifts[j]
      if (a.employee_id !== b.employee_id) continue
      pair = [a.shift_id, b.shift_id]
      push('pair', 'ON a.employee_id', 'shift_id_a < ', `Compare shift ${a.shift_id} with later shift ${b.shift_id} for employee ${a.employee_id}.`)
      if (a.start_time < b.end_time && b.start_time < a.end_time) {
        counts.set(a.employee_id, (counts.get(a.employee_id) || 0) + 1)
        push('overlap', 'WHERE a.start_time', 'start_time_a < pairs', `Shifts ${a.shift_id} and ${b.shift_id} share minutes, so this pair counts once.`)
      } else {
        push('apart', 'WHERE a.start_time', 'start_time_a < pairs', `Shifts ${a.shift_id} and ${b.shift_id} only touch or stay apart, so they do not count.`)
      }
    }
  }
  const result = rows()
  push('output', 'ORDER BY a.employee_id', 'return out', `Return ${result.length} employee row${result.length === 1 ? '' : 's'}.`)
  return { input, result, frames }
}
