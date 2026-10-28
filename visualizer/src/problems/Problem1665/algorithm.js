export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with a tasks key.')
  const { tasks } = input
  if (!Array.isArray(tasks) || tasks.length < 1 || tasks.length > 12) throw new Error('tasks needs 1 to 12 pairs.')
  if (tasks.some(t => !Array.isArray(t) || t.length !== 2 || !t.every(Number.isInteger) || t[0] < 1 || t[0] > t[1] || t[1] > 100)) {
    throw new Error('Each task is [actual, minimum] with 1 <= actual <= minimum <= 100.')
  }
  return { tasks }
}

export function buildTrace(input) {
  const { tasks } = input
  const gap = i => tasks[i][1] - tasks[i][0]
  const order = tasks.map((_, i) => i).sort((a, b) => gap(b) - gap(a) || a - b)
  let spent = 0
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('sort the tasks'), task: -1, spent, best, message: 'Sort the tasks by minimum minus actual, largest gap first.' }]
  for (const i of order) {
    const [actual, minimum] = tasks[i]
    const need = spent + minimum
    best = Math.max(best, need)
    frames.push({ phase: 'task', activeLine: L('larger of best'), task: i, spent, need, best, message: `Task [${actual}, ${minimum}] needs ${need} energy at its start; best is ${best}.` })
    spent += actual
    frames.push({ phase: 'spend', activeLine: L('add actual to spent'), task: i, spent, need, best, message: `Finishing the task spends ${actual}; ${spent} spent so far.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), task: -1, spent, best, message: `Minimum initial energy: ${best}.` })
  return { input, result: best, frames }
}

export const code = `minimum initial energy to finish all tasks:
  sort the tasks by minimum minus actual, largest first
  set spent to 0 and best to 0
  for each task in that order
    set best to the larger of best and spent plus minimum
    add actual to spent
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_initial_energy(tasks):
    order = sorted(tasks, key=lambda t: t[1] - t[0], reverse=True)
    spent = 0
    best = 0
    for actual, minimum in order:
        best = max(best, spent + minimum)
        spent += actual
    return best
`
