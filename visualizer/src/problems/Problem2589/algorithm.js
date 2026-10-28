export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with a tasks array.')
  const { tasks } = data
  if (!Array.isArray(tasks) || tasks.length < 1 || tasks.length > 3) throw new Error('tasks must have 1 to 3 entries.')
  for (const t of tasks) {
    if (!Array.isArray(t) || t.length !== 3 || !t.every(Number.isInteger)) throw new Error('Each task is [start, end, duration] with integers.')
    const [s, e, d] = t
    if (s < 1 || e > 10 || s > e) throw new Error('Times are integers from 1 to 10 with start at most end.')
    if (d < 1 || d > e - s + 1) throw new Error('Duration must be at least 1 and fit inside the interval.')
  }
  return { tasks }
}

export function buildTrace(input) {
  const { tasks } = input
  const horizon = Math.max(...tasks.map(t => t[1]))
  const on = new Array(horizon + 1).fill(false)
  const order = tasks.map((_, i) => i).sort((a, b) => tasks[a][1] - tasks[b][1] || tasks[a][0] - tasks[b][0])
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set on seconds to none'), on: [...on], index: -1, count, message: 'Tasks are handled by deadline. The computer runs one task per on-second.' }]
  for (const i of order) {
    const [s, e, d] = tasks[i]
    let already = 0
    for (let t = s; t <= e; t++) if (on[t]) already++
    let need = d - already
    for (let t = e; t >= s && need > 0; t--) {
      if (on[t]) continue
      on[t] = true
      need -= 1
      count += 1
      frames.push({ phase: 'on', activeLine: L('turn the computer on at the latest'), on: [...on], index: t, count, message: `Task ${i} needs ${d} seconds; turn the computer on at second ${t}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the number of on seconds'), on: [...on], index: -1, count, message: `Minimum on-seconds: ${count}.` })
  return { input, result: count, frames }
}

export const code = `minimum number of seconds the computer must be on:
  set on seconds to none
  sort the tasks by end time, then by start time
  for each task in that order
    count the on seconds already inside its window
    while it still needs more seconds
      turn the computer on at the latest free second in its window
  return the number of on seconds`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_on_seconds(tasks):
    horizon = max(t[1] for t in tasks)
    on = [False] * (horizon + 1)
    count = 0
    for s, e, d in sorted(tasks, key=lambda t: (t[1], t[0])):
        already = sum(1 for t in range(s, e + 1) if on[t])
        need = d - already
        for t in range(e, s - 1, -1):
            if need <= 0:
                break
            if not on[t]:
                on[t] = True
                need -= 1
                count += 1
    return count
`
