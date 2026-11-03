export const phases = [
  { id: 'start', label: 'Read', description: 'Read the workers and the tasks.' },
  { id: 'group', label: 'Group', description: 'Match each skill with the top-profit tasks it has workers for.' },
  { id: 'base', label: 'Base', description: 'Total the skill-matched profit.' },
  { id: 'extra', label: 'Extra', description: 'Let the extra worker take one task and re-match the rest.' },
  { id: 'record', label: 'Record', description: 'Keep the best total.' },
  { id: 'done', label: 'Result', description: 'Return the maximum profit.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with workers and tasks.')
  const { workers, tasks } = input
  if (!Array.isArray(workers) || workers.length < 1 || workers.length > 6) throw new Error('workers is a list of 1 to 6 skills.')
  if (!Array.isArray(tasks) || tasks.length < 1 || tasks.length > 6) throw new Error('tasks is a list of 1 to 6 [skill, profit] pairs.')
  const skillOk = s => Number.isInteger(s) && s >= 1 && s <= 5
  if (!workers.every(skillOk)) throw new Error('Worker skills are integers from 1 to 5.')
  for (const pair of tasks) {
    if (!Array.isArray(pair) || pair.length !== 2 || !skillOk(pair[0]) || !Number.isInteger(pair[1]) || pair[1] < 1 || pair[1] > 9) {
      throw new Error('Each task is [skill from 1 to 5, profit from 1 to 9].')
    }
  }
  return { workers: workers.slice(), tasks: tasks.map(([skill, profit]) => [skill, profit]) }
}

export const code = [
  'maximize profit from task assignment',
  '  count the workers of each skill',
  '  for each skill in the tasks',
  '    rank its tasks by profit, highest first',
  '    take as many tasks as it has workers',
  '  best = total profit of the taken tasks',
  '  for each task t given to the extra worker',
  '    best = max(best, profit of t plus the same greedy total without t)',
  '  return best',
].map((text, index) => ({ line: index + 1, text }))

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

// Per skill: the ranked tasks, how many workers have that skill, and which tasks are taken.
function groupState(workers, tasks, skip) {
  const skills = [...new Set(tasks.map(([skill]) => skill))].sort((a, b) => a - b)
  return skills.map(skill => {
    const workerCount = workers.filter(w => w === skill).length
    const ranked = tasks
      .map(([s, profit], index) => ({ index, skill: s, profit }))
      .filter(t => t.skill === skill && t.index !== skip)
      .sort((a, b) => b.profit - a.profit || a.index - b.index)
    const taken = ranked.slice(0, workerCount)
    return { skill, workers: workerCount, ranked: ranked.map(t => t.index), taken: taken.map(t => t.index), subtotal: taken.reduce((sum, t) => sum + t.profit, 0) }
  })
}

const greedyTotal = (workers, tasks, skip) => groupState(workers, tasks, skip).reduce((sum, g) => sum + g.subtotal, 0)

export function buildTrace({ workers, tasks }) {
  const frames = []
  const groups0 = groupState(workers, tasks, -1)
  frames.push({ phase: 'start', activeLine: L('maximize profit'), pythonLine: P('def maximize'), workers, tasks, groups: [], extraTask: -1, best: null, result: null, message: `${workers.length} workers and ${tasks.length} tasks. The extra worker is not counted in the skill groups.` })
  for (const g of groups0) {
    frames.push({ phase: 'group', activeLine: L('take as many'), pythonLine: P('ranked = sorted((p'), workers, tasks, groups: groupState(workers, tasks, -1).filter(x => x.skill <= g.skill), extraTask: -1, best: null, result: null, message: `Skill ${g.skill}: ${g.workers} worker${g.workers === 1 ? '' : 's'} take the top ${g.taken.length} task${g.taken.length === 1 ? '' : 's'}, profit ${g.subtotal}.` })
  }
  let best = greedyTotal(workers, tasks, -1)
  frames.push({ phase: 'base', activeLine: L('best = total profit'), pythonLine: P('best = greedy_total(-1)'), workers, tasks, groups: groups0, extraTask: -1, best, result: null, message: `Skill matching alone earns ${best}. The extra worker may add one more task.` })
  for (let t = 0; t < tasks.length; t++) {
    const [skill, profit] = tasks[t]
    const rest = greedyTotal(workers, tasks, t)
    const candidate = profit + rest
    frames.push({ phase: 'extra', activeLine: L('for each task t'), pythonLine: P('for t, (skill, profit)'), workers, tasks, groups: groupState(workers, tasks, t), extraTask: t, best, candidate, result: null, message: `Give task ${t} (skill ${skill}, profit ${profit}) to the extra worker; the rest re-match to ${rest}. Total ${candidate}.` })
    if (candidate > best) {
      best = candidate
      frames.push({ phase: 'record', activeLine: L('best = max'), pythonLine: P('best = max'), workers, tasks, groups: groupState(workers, tasks, t), extraTask: t, best, candidate, result: null, message: `${candidate} beats the earlier best; record it.` })
    } else {
      frames.push({ phase: 'record', activeLine: L('best = max'), pythonLine: P('best = max'), workers, tasks, groups: groupState(workers, tasks, t), extraTask: t, best, candidate, result: null, message: `${candidate} does not beat ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), workers, tasks, groups: groups0, extraTask: -1, best, result: best, message: `The maximum total profit is ${best}.` })
  return { input: { workers, tasks }, result: best, frames }
}

export const python = `def maximize_profit(workers, tasks):
    counts = {}
    for skill in workers:
        counts[skill] = counts.get(skill, 0) + 1

    def greedy_total(skip):
        total = 0
        for skill in sorted({s for s, _ in tasks}):
            ranked = sorted((p for i, (s, p) in enumerate(tasks) if s == skill and i != skip), reverse=True)
            total += sum(ranked[:counts.get(skill, 0)])
        return total

    best = greedy_total(-1)
    for t, (skill, profit) in enumerate(tasks):
        best = max(best, profit + greedy_total(t))
    return best
`
