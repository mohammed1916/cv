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
    frames.push({ pythonLine: PY('best = min'), phase: 'scan', activeLine: L('const finish'), at: index, finish, best, bestIndex,
      message: `Task ${index} starts at ${start} and takes ${duration}, so it ends at ${finish}. Best so far: ${best}.` })
  })
  frames.push({ pythonLine: PY('return best'), phase: 'done', activeLine: L('return best'), at: -1, finish: null, best, bestIndex,
    message: `The earliest finish is ${best}.` })
  return { input: { tasks }, result: best, frames }
}

export const code = `function earliestFinish(tasks) {
  let best = Infinity
  for (const [start, duration] of tasks) {
    const finish = start + duration
    best = Math.min(best, finish)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}

export const python = `def earliest_finish(tasks):
    best = float('inf')
    for start, duration in tasks:
        best = min(best, start + duration)
    return best
`
const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}
