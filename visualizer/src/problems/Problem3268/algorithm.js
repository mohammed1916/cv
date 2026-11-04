// Teaching model written for this visualizer. Times are whole minutes from a shared origin.
export const phases = [
  { id: 'load', label: 'Load', description: 'Turn each shift into a start event (+1) and an end event (-1).' },
  { id: 'sweep', label: 'Sweep', description: 'Walk the events in time order and track how many shifts are active.' },
  { id: 'pair', label: 'Pair overlap', description: 'Add the minutes shared by two shifts that start one after the other.' },
  { id: 'output', label: 'Result', description: 'Return the peak count and the total overlap minutes per employee.' },
]

export const code = `WITH events AS (
  SELECT employee_id, start_time AS t, 1 AS delta FROM EmployeeShifts
  UNION ALL
  SELECT employee_id, end_time, -1 FROM EmployeeShifts
),
running AS (
  SELECT employee_id, SUM(delta) OVER (PARTITION BY employee_id ORDER BY t, delta) AS active
  FROM events
),
peaks AS (
  SELECT employee_id, MAX(active) AS max_overlapping_shifts FROM running GROUP BY employee_id
),
pair_minutes AS (
  SELECT s1.employee_id,
         TIMESTAMPDIFF(MINUTE, s2.start_time, LEAST(s1.end_time, s2.end_time)) AS minutes
  FROM EmployeeShifts s1
  JOIN EmployeeShifts s2
    ON s1.employee_id = s2.employee_id
   AND s1.start_time < s2.start_time
   AND s1.end_time > s2.start_time
),
overlap AS (
  SELECT employee_id, SUM(minutes) AS total_overlap_duration FROM pair_minutes GROUP BY employee_id
)
SELECT p.employee_id, p.max_overlapping_shifts, COALESCE(o.total_overlap_duration, 0) AS total_overlap_duration
FROM peaks p
LEFT JOIN overlap o USING (employee_id)
ORDER BY p.employee_id`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def overlapping_shifts(df):
    starts = df[['employee_id', 'start_time']].rename(columns={'start_time': 't'}).assign(delta=1)
    ends = df[['employee_id', 'end_time']].rename(columns={'end_time': 't'}).assign(delta=-1)
    events = pd.concat([starts, ends]).sort_values(['employee_id', 't', 'delta'])
    events['active'] = events.groupby('employee_id')['delta'].cumsum()
    peaks = events.groupby('employee_id', as_index=False)['active'].max()
    pairs = df.merge(df, on='employee_id', suffixes=('_1', '_2'))
    pairs = pairs[(pairs.start_time_1 < pairs.start_time_2) & (pairs.end_time_1 > pairs.start_time_2)]
    pairs['minutes'] = (pairs[['end_time_1', 'end_time_2']].min(axis=1) - pairs.start_time_2).dt.total_seconds() // 60
    totals = pairs.groupby('employee_id', as_index=False)['minutes'].sum()
    out = peaks.merge(totals, on='employee_id', how='left').fillna(0)
    return out.rename(columns={'active': 'max_overlapping_shifts', 'minutes': 'total_overlap_duration'}).sort_values('employee_id')
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
  const keys = new Set()
  for (const row of input.EmployeeShifts) {
    if (!Number.isInteger(row.employee_id)) throw new Error('employee_id must be an integer.')
    if (!Number.isInteger(row.start_time) || !Number.isInteger(row.end_time) || row.start_time < 0 || row.start_time >= row.end_time) {
      throw new Error('Each shift needs whole-minute start_time before end_time.')
    }
    const key = `${row.employee_id}@${row.start_time}`
    if (keys.has(key)) throw new Error('(employee_id, start_time) must be unique.')
    keys.add(key)
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
  const peak = new Map()
  const minutes = new Map()
  const employees = [...new Set(shifts.map(r => r.employee_id))].sort((a, b) => a - b)
  const rows = () => employees.map(employee_id => ({
    employee_id,
    max_overlapping_shifts: peak.get(employee_id) || 0,
    total_overlap_duration: minutes.get(employee_id) || 0,
  }))
  const intervalsNow = (marker) => shifts.map(r => ({
    group: `E${r.employee_id}`, start: r.start_time, end: r.end_time, role: marker !== null && r.start_time <= marker && marker < r.end_time ? 'active' : 'pending', label: `${r.start_time}–${r.end_time}`,
  }))
  const frames = []
  let marker = null
  const push = (phase, sqlText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: lookupCode(sqlText), pythonLine: lookupPython(pyText), message, rows: rows(),
    employees, marker, intervals: intervalsNow(marker), active: Object.fromEntries(active), ...extra,
  })
  push('load', 'WITH events', 'starts = ', `Create ${events.length} events from ${shifts.length} shifts.`)
  for (const e of events) {
    marker = e.t
    const now = (active.get(e.employee_id) || 0) + e.delta
    active.set(e.employee_id, now)
    if (e.delta < 0) {
      push('sweep', 'end_time, -1', 'assign(delta=-1)', `Employee ${e.employee_id}: a shift ends at minute ${e.t}, ${now} active now.`, { currentEmployee: e.employee_id })
      continue
    }
    if (now > (peak.get(e.employee_id) || 0)) peak.set(e.employee_id, now)
    push('sweep', 'start_time AS t', 'assign(delta=1)', `Employee ${e.employee_id}: a shift starts at minute ${e.t}, ${now} active now.`, { currentEmployee: e.employee_id })
  }
  for (const a of shifts) {
    for (const b of shifts) {
      if (a.employee_id !== b.employee_id || !(a.start_time < b.start_time && a.end_time > b.start_time)) continue
      const shared = Math.min(a.end_time, b.end_time) - b.start_time
      minutes.set(a.employee_id, (minutes.get(a.employee_id) || 0) + shared)
      marker = b.start_time
      push('pair', 'pair_minutes AS', 'pairs = df.merge', `Shifts starting ${a.start_time} and ${b.start_time} share ${shared} minute(s) for employee ${a.employee_id}.`, { currentEmployee: a.employee_id, pairFrom: a.start_time, pairTo: b.start_time })
    }
  }
  marker = null
  const result = rows()
  push('output', 'ORDER BY p.employee_id', 'return out', `Return ${result.length} employee row${result.length === 1 ? '' : 's'}.`)
  return { input, result, frames }
}
