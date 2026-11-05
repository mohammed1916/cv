export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with tasks.')
  const { tasks } = input
  if (!Array.isArray(tasks) || tasks.length < 1 || tasks.length > 30) throw new Error('tasks has 1 to 30 values.')
  if (!tasks.every(t => Number.isInteger(t) && t >= 1 && t <= 9)) throw new Error('Each task is a difficulty from 1 to 9.')
  return { tasks }
}

export function buildTrace({ tasks }) {
  const counts = new Map()
  const frames = []
  for (const t of tasks) counts.set(t, (counts.get(t) ?? 0) + 1)
  const groups = [...counts.entries()].map(([level, count]) => ({ level, count, rounds: count === 1 ? null : Math.ceil(count / 3) }))
  frames.push({ pythonLine: PL('counts = {}'), phase: 'count', activeLine: CL('const counts'), groups, rounds: 0, message: `Count how many tasks share each difficulty.` })
  let rounds = 0
  let impossible = false
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i]
    if (g.count === 1) {
      impossible = true
      frames.push({ pythonLine: PL('return -1'), phase: 'stuck', activeLine: CL('return -1'), groups, at: i, rounds: -1, message: `Difficulty ${g.level} has one task, which no round can finish. Return -1.` })
      break
    }
    rounds += g.rounds
    frames.push({ pythonLine: PL('rounds +='), phase: 'add', activeLine: CL('rounds += Math.ceil'), groups, at: i, rounds, message: `${g.count} tasks of difficulty ${g.level} need ${g.rounds} round${g.rounds === 1 ? '' : 's'} of 2 or 3.` })
  }
  const result = impossible ? -1 : rounds
  if (!impossible) frames.push({ pythonLine: PL('return rounds'), phase: 'done', activeLine: CL('return rounds'), groups, at: -1, rounds, message: `Total rounds: ${rounds}.` })
  return { input: { tasks }, result, frames }
}

export const code = `function minimumRounds(tasks) {
  const counts = new Map();
  for (const t of tasks) counts.set(t, (counts.get(t) ?? 0) + 1);
  let rounds = 0;
  for (const c of counts.values()) {
    if (c === 1) return -1;
    rounds += Math.ceil(c / 3);
  }
  return rounds;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def minimum_rounds(tasks):
    counts = {}
    for t in tasks:
        counts[t] = counts.get(t, 0) + 1
    rounds = 0
    for c in counts.values():
        if c == 1:
            return -1
        rounds += (c + 2) // 3
    return rounds
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
