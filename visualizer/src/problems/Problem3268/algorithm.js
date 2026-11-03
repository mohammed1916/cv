// Knowledge-derived teaching model written for this visualizer. Not the official statement text.
export const phases = [
  { id: 'load', label: 'Load', description: 'Turn each shift into a start event and an end event.' },
  { id: 'open', label: 'Open', description: 'A shift starts and adds one active shift.' },
  { id: 'close', label: 'Close', description: 'A shift ends and removes one active shift.' },
  { id: 'peak', label: 'Peak', description: 'The running count reached a new maximum.' },
  { id: 'output', label: 'Result', description: 'Return the peak for each employee.' },
]

export const code = `WITH events AS (
  SELECT employee_id, start_time AS t, 1 AS delta FROM EmployeeShifts
  UNION ALL
  SELECT employee_id, end_time, -1 FROM EmployeeShifts
),
running AS (
  SELECT employee_id, SUM(delta) OVER (PARTITION BY employee_id ORDER BY t, delta) AS active
  FROM events
)
SELECT employee_id, MAX(active) AS max_concurrent
FROM running
GROUP BY employee_id
ORDER BY employee_id`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_concurrent(df):
    starts = df[['employee_id', 'start_time']].rename(columns={'start_time': 't'}).assign(delta=1)
    ends = df[['employee_id', 'end_time']].rename(columns={'end_time': 't'}).assign(delta=-1)
    events = pd.concat([starts, ends]).sort_values(['employee_id', 't', 'delta'])
    events['active'] = events.groupby('employee_id')['delta'].cumsum()
    out = events.groupby('employee_id', as_index=False)['active'].max()
    return out.rename(columns={'active': 'max_concurrent'}).sort_values('employee_id')
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
  if (input.EmployeeShifts.length < 1 || input.EmployeeShifts.length > 12) throw new Error('Use 1 to 12 shifts so each step stays readable.')
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
  const shifts = input.EmployeeShifts
  const events = []
  for (const r of shifts) {
    events.push({ employee_id: r.employee_id, t: r.start_time, delta: 1 })
    events.push({ employee_id: r.employee_id, t: r.end_time, delta: -1 })
  }
  // Ends sort before starts at the same minute, so back-to-back shifts never count as concurrent.
  events.sort((a, b) => a.employee_id - b.employee_id || a.t - b.t || a.delta - b.delta)
  const active = new Map()
  const best = new Map()
  const rows = () => [...best].sort(([a], [b]) => a - b).map(([employee_id, max_concurrent]) => ({ employee_id, max_concurrent }))
  const frames = []
  const push = (phase, sqlText, pyText, message) => frames.push({
    phase, activeLine: lookupCode(sqlText), pythonLine: lookupPython(pyText), message, rows: rows(),
  })
  push('load', 'WITH events', 'starts = ', `Create ${events.length} events from ${shifts.length} shifts.`)
  for (const e of events) {
    const now = (active.get(e.employee_id) || 0) + e.delta
    active.set(e.employee_id, now)
    if (e.delta < 0) {
      push('close', 'end_time, -1', 'assign(delta=-1)', `Employee ${e.employee_id} has a shift end at minute ${e.t}; ${now} active now.`)
      continue
    }
    push('open', 'start_time AS t', 'assign(delta=1)', `Employee ${e.employee_id} has a shift start at minute ${e.t}; ${now} active now.`)
    if (now > (best.get(e.employee_id) || 0)) {
      best.set(e.employee_id, now)
      push('peak', 'MAX(active)', 'as_index', `New peak for employee ${e.employee_id}: ${now} shifts at once.`)
    }
  }
  const result = rows()
  push('output', 'ORDER BY employee_id', 'return out', `Return ${result.length} employee row${result.length === 1 ? '' : 's'}.`)
  return { input, result, frames }
}
