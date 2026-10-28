export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, headID, manager and informTime.')
  const { n, headID, manager, informTime } = input
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('Use between 1 and 12 employees.')
  if (!Number.isInteger(headID) || headID < 0 || headID >= n) throw new Error('headID must be an employee number from 0 to n-1.')
  if (!Array.isArray(manager) || manager.length !== n || manager[headID] !== -1) throw new Error('manager needs n entries, with -1 for the head.')
  if (!Array.isArray(informTime) || informTime.length !== n || informTime.some(t => !Number.isInteger(t) || t < 0 || t > 100)) throw new Error('informTime needs n integers from 0 to 100.')
  manager.forEach((m, i) => {
    if (i !== headID && (!Number.isInteger(m) || m < 0 || m >= n)) throw new Error('Every other employee needs a valid manager.')
  })
  // Following managers from anyone must reach the head, which rules out cycles.
  for (let i = 0; i < n; i++) {
    let cur = i, steps = 0
    while (cur !== headID) {
      cur = manager[cur]
      if (++steps > n) throw new Error('Managers must form a tree under headID.')
    }
  }
  return input
}

export function buildTrace({ n, headID, manager, informTime }) {
  const children = Array.from({ length: n }, () => [])
  const edges = []
  manager.forEach((m, i) => { if (m !== -1) { children[m].push(i); edges.push([m, i]) } })
  let answer = 0
  const heard = new Map()
  const frames = [{ phase: 'start', activeLine: L('set answer to zero'), node: null, heard: {}, answer: 0, message: `Employee ${headID} is the head and starts the news at minute 0.` }]
  const spread = (employee, time) => {
    heard.set(employee, time)
    if (time > answer) answer = time
    frames.push({ phase: 'spread', activeLine: L('if time is greater'), node: employee, heard: Object.fromEntries(heard), answer, message: `Employee ${employee} hears the news at minute ${time}.` })
    for (const report of children[employee]) spread(report, time + informTime[employee])
  }
  spread(headID, 0)
  frames.push({ phase: 'done', activeLine: L('return answer'), node: null, heard: Object.fromEntries(heard), answer, message: `Everyone is informed after ${answer} minute(s).` })
  return { input: { n, headID, manager, informTime }, result: answer, frames, edges }
}

export const code = `time needed to inform everyone:
  set answer to zero
  call spread on the head with time zero
  return answer
spread(employee, time):
  if time is greater than answer then set answer to time
  for each direct report of employee, call spread on it with time plus informTime of employee`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_of_minutes(n, headID, manager, informTime):
    children = [[] for _ in range(n)]
    for i, m in enumerate(manager):
        if m != -1:
            children[m].append(i)
    answer = 0

    def spread(employee, time):
        nonlocal answer
        if time > answer:
            answer = time
        for report in children[employee]:
            spread(report, time + informTime[employee])

    spread(headID, 0)
    return answer
`
