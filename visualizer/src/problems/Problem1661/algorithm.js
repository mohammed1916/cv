// Knowledge-derived SQL lesson. The sample tables are invented for this visualization.
export const sql = `select s.machine_id, round(avg(e.timestamp - s.timestamp), 3) as processing_time
from Activity s
join Activity e on e.machine_id = s.machine_id and e.process_id = s.process_id
where s.activity_type = 'start' and e.activity_type = 'end'
group by s.machine_id
order by s.machine_id`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def machine_averages(activity):
    starts = activity[activity['activity_type'] == 'start']
    ends = activity[activity['activity_type'] == 'end']
    pairs = starts.merge(ends, on=['machine_id', 'process_id'], suffixes=('_s', '_e'))
    pairs['processing_time'] = pairs['timestamp_e'] - pairs['timestamp_s']
    averages = pairs.groupby('machine_id')['processing_time'].mean().round(3).reset_index()
    return averages.sort_values('machine_id')`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Activity rows.' },
  { id: 'pair', label: 'Pair', description: 'Match each start with the end of the same machine and process.' },
  { id: 'duration', label: 'Duration', description: 'Subtract start from end for each process.' },
  { id: 'group', label: 'Average', description: 'Average the durations for each machine, rounded to three decimals.' },
  { id: 'order', label: 'Order', description: 'Sort by machine id.' },
  { id: 'done', label: 'Result', description: 'Report the average per machine.' },
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an activity list.')
  if (!Array.isArray(input.activity) || input.activity.length < 2 || input.activity.length > 20) throw new Error('activity is a list of 2 to 20 rows.')
  for (const a of input.activity) {
    if (typeof a.machine_id !== 'number' || typeof a.process_id !== 'number'
      || !['start', 'end'].includes(a.activity_type) || !Number.isInteger(a.timestamp)) {
      throw new Error('Each row has machine_id, process_id, activity_type ("start" or "end") and an integer timestamp.')
    }
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const rows = input.activity.map(a => ({ ...a }))
  frames.push(frame('load', 'from Activity s', 'def machine_averages', rows, [], `Read ${rows.length} activity rows.`))
  const starts = new Map()
  const pairs = []
  for (const a of rows) {
    const key = `${a.machine_id}|${a.process_id}`
    if (a.activity_type === 'start') starts.set(key, a)
    else if (starts.has(key)) pairs.push({ machine_id: a.machine_id, process_id: a.process_id, start_at: starts.get(key).timestamp, end_at: a.timestamp })
  }
  frames.push(frame('pair', 'join Activity e', 'pairs = starts.merge', pairs, [], `Matched ${pairs.length} processes.`))
  const durations = pairs.map(p => ({ ...p, processing_time: p.end_at - p.start_at }))
  frames.push(frame('duration', 'e.timestamp - s.timestamp', "pairs['processing_time'] =", durations, [], 'Each process takes end minus start.'))
  const byMachine = new Map()
  for (const d of durations) {
    const entry = byMachine.get(d.machine_id) ?? { machine_id: d.machine_id, sum: 0, count: 0 }
    entry.sum += d.processing_time
    entry.count += 1
    byMachine.set(d.machine_id, entry)
  }
  const averages = [...byMachine.values()].map(e => ({ machine_id: e.machine_id, processing_time: Math.round((e.sum / e.count) * 1000) / 1000 }))
  frames.push(frame('group', 'avg(e.timestamp', "groupby('machine_id')", averages, [], 'Average the processes of each machine.'))
  const ordered = [...averages].sort((a, b) => a.machine_id - b.machine_id)
  frames.push(frame('order', 'order by s.machine_id', "sort_values('machine_id')", ordered, [], 'Sort by machine id.'))
  const result = ordered.map(a => ({ ...a }))
  frames.push(frame('done', 'select s.machine_id', 'return averages', result, result, `Returned ${result.length} machines.`))
  return { input, result, frames }
}
