export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with tasks and space.')
  const { tasks, space } = input
  if (!Array.isArray(tasks) || tasks.length < 1 || tasks.length > 24) throw new Error('tasks has 1 to 24 entries in this visualization.')
  if (!tasks.every(t => Number.isInteger(t) && t >= 1 && t <= 20)) throw new Error('Each task is an integer from 1 to 20.')
  if (!Number.isInteger(space) || space < 1 || space > 20) throw new Error('space is an integer from 1 to 20.')
  return { tasks, space }
}

export function buildTrace({ tasks, space }) {
  const frames = []
  const last = new Map()
  let day = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('day = 0'), at: -1, day, task: null, last: {}, result: null, message: `Schedule ${tasks.length} tasks with space ${space}.` })
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    frames.push({ pythonLine: 4, phase: 'next', activeLine: L('for each task'), at: i, day, task, last: Object.fromEntries(last), result: null, message: `Next task is ${task}.` })
    day += 1
    frames.push({ pythonLine: 5, phase: 'tick', activeLine: L('day += 1'), at: i, day, task, last: Object.fromEntries(last), result: null, message: `Day ${day} is the earliest slot for ${task}.` })
    if (last.has(task) && day - last.get(task) <= space) {
      const jump = last.get(task) + space + 1
      frames.push({ pythonLine: 7, phase: 'wait', activeLine: L('day = last'), at: i, day: jump, task, last: Object.fromEntries(last), result: null, message: `${task} last ran on day ${last.get(task)}; wait until day ${jump}.` })
      day = jump
    }
    last.set(task, day)
    frames.push({ pythonLine: 8, phase: 'run', activeLine: L('last[task]'), at: i, day, task, last: Object.fromEntries(last), result: null, message: `Run ${task} on day ${day}.` })
  }
  frames.push({ pythonLine: 9, phase: 'done', activeLine: L('return day'), at: -1, day, task: null, last: Object.fromEntries(last), result: day, message: `All tasks finish by day ${day}.` })
  return { input: { tasks, space }, result: day, frames }
}

export const code = `minimum days to finish all tasks in order with a gap of space
  day = 0
  last = empty map from task to its last day
  for each task in tasks
    day += 1
    if task ran before and day minus its last day is at most space
      day = last day of task plus space plus 1
    set last[task] to day
  return day`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def task_scheduler_ii(tasks, space):
    day = 0
    last = {}
    for task in tasks:
        day += 1
        if task in last and day - last[task] <= space:
            day = last[task] + space + 1
        last[task] = day
    return day
`
