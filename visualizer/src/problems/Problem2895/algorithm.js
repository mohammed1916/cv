export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with processorTime and tasks.')
  const { processorTime, tasks } = data
  if (!Array.isArray(processorTime) || processorTime.length < 1 || processorTime.length > 3) throw new Error('processorTime must have 1 to 3 entries.')
  if (processorTime.some(v => !Number.isInteger(v) || v < 0 || v > 1000)) throw new Error('Processor times are integers from 0 to 1000.')
  if (!Array.isArray(tasks) || tasks.length !== 4 * processorTime.length) throw new Error('tasks must have exactly four entries per processor.')
  if (tasks.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Task times are integers from 1 to 1000.')
  return { processorTime, tasks }
}

export function buildTrace(input) {
  const procs = [...input.processorTime].sort((a, b) => a - b)
  const ts = [...input.tasks].sort((a, b) => b - a)
  const finish = []
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('sort the processors'), index: -1, finish: [], best, message: 'Sort processors by availability and tasks from largest to smallest.' }]
  procs.forEach((start, i) => {
    const longest = ts[4 * i]
    const done = start + longest
    finish.push(done)
    best = Math.max(best, done)
    frames.push({ phase: 'assign', activeLine: L('its finish time'), index: i, finish: [...finish], best, message: `Processor ${i} is free at ${start}; its four tasks end at ${done} (longest task ${longest}).` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, finish: [...finish], best, message: `Earliest possible finish time: ${best}.` })
  return { input, result: best, frames }
}

export const code = `earliest time all tasks can finish:
  sort the processors by availability, earliest first
  sort the tasks from largest to smallest
  set best to zero
  for each processor in that order
    give it the next four tasks from the sorted list
    its finish time is its availability plus its largest task
    if that finish time is greater than best then set best to it
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_processing_time(processorTime, tasks):
    procs = sorted(processorTime)
    ts = sorted(tasks, reverse=True)
    best = 0
    for i, start in enumerate(procs):
        best = max(best, start + ts[4 * i])
    return best
`
