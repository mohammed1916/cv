export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.logs)) throw new Error('Use an object with n and a logs array of [id, leaveTime] pairs.')
  const { n, logs } = input
  if (!Number.isInteger(n) || n < 2 || n > 20) throw new Error('n is an integer from 2 to 20.')
  if (logs.length < 1 || logs.length > 20) throw new Error('logs holds 1 to 20 pairs.')
  let previous = 0
  for (const pair of logs) {
    if (!Array.isArray(pair) || pair.length !== 2) throw new Error('Each log is [id, leaveTime].')
    const [id, leave] = pair
    if (!Number.isInteger(id) || id < 0 || id >= n) throw new Error('Each id is an integer from 0 to n minus 1.')
    if (!Number.isInteger(leave) || leave <= previous || leave > 200) throw new Error('Leave times are integers that strictly increase, up to 200.')
    previous = leave
  }
  return { n, logs }
}

export function buildTrace(input) {
  const { logs } = input
  const frames = [{ phase: 'start', activeLine: L('set the longest duration'), index: -1, id: null, duration: null, answer: -1, replaced: false, message: 'No task has been considered yet.' }]
  let bestId = -1
  let bestDuration = -1
  let previous = 0
  const durations = []
  logs.forEach(([id, leave], index) => {
    const duration = leave - previous
    durations.push(duration)
    const replaced = duration > bestDuration || (duration === bestDuration && id < bestId)
    if (replaced) { bestId = id; bestDuration = duration }
    frames.push({ phase: 'task', activeLine: L('the task duration is'), index, id, duration, answer: bestId, replaced, message: `Employee ${id} works ${duration} unit(s), leaving at ${leave}. ${replaced ? 'This is the longest task so far.' : 'This does not beat the longest task.'}` })
    previous = leave
  })
  frames.push({ phase: 'done', activeLine: L('return the answer id'), index: -1, id: null, duration: null, answer: bestId, replaced: false, message: `Employee ${bestId} worked the longest task.` })
  return { input, durations, result: bestId, frames }
}

export const code = `employee with the longest task
  set the longest duration to minus one and the answer id to minus one
  set the previous leave time to zero
  for each log [id, leave time] in order
    the task duration is leave time minus the previous leave time
    if the duration is longer, or equal with a smaller id, keep this employee
    set the previous leave time to leave time
  return the answer id`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def hardest_worker(n, logs):
    best_id = -1
    best_duration = -1
    previous = 0
    for employee, leave_time in logs:
        duration = leave_time - previous
        if duration > best_duration or (duration == best_duration and employee < best_id):
            best_id = employee
            best_duration = duration
        previous = leave_time
    return best_id
`
