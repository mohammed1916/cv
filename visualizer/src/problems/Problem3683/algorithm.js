const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const tasks = JSON.parse(text)
  if (!Array.isArray(tasks) || tasks.length < 1 || tasks.length > 100) throw new Error('Use a JSON array of 1 to 100 [start, duration] pairs.')
  if (!tasks.every(p => Array.isArray(p) && p.length === 2 && p.every(v => Number.isInteger(v) && v >= 1 && v <= 100))) throw new Error('Each task is [start, duration] with values from 1 to 100.')
  return { tasks }
}

export function buildTrace({ tasks }) {
  const frames = []
  let best = Infinity
  let bestIndex = -1
  tasks.forEach(([start, duration], index) => {
    const finish = start + duration
    if (finish < best) { best = finish; bestIndex = index }
    frames.push({ pythonLine: PY('best = min'), phase: 'scan', activeLine: L('finish = start'), at: index, finish, best, bestIndex,
      message: `Task ${index} starts at ${start} and takes ${duration}, so it ends at ${finish}. Best so far: ${best}.` })
  })
  frames.push({ pythonLine: PY('return best'), phase: 'done', activeLine: L('return best'), at: -1, finish: null, best, bestIndex,
    message: `The earliest finish is ${best}.` })
  return { input: { tasks }, result: best, frames }
}

export const code = [
  'earliest time at which one task finishes',
  '  best = infinity',
  '  for each task with start and duration',
  '    finish = start + duration',
  '    keep the smaller finish time',
  '  return best',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def earliest_finish(tasks):
    best = float('inf')
    for start, duration in tasks:
        best = min(best, start + duration)
    return best
`
