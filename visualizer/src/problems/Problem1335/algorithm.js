export const phases = [
  { id: 'start', label: 'Start', description: 'Set up the table: zero jobs cost nothing, and every other prefix is not yet reachable.' },
  { id: 'split', label: 'Day block', description: 'Begin one more day. Every prefix that uses this day must end with a block that starts on or after the previous day boundary.' },
  { id: 'update', label: 'Best last block', description: 'For a prefix length, try every start of the last block and keep the cheapest total.' },
  { id: 'done', label: 'Complete', description: 'Return the cost for all jobs, or -1 when there are fewer jobs than days.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"jobDifficulty": [6, 5, 4], "d": 2}.')
  const { jobDifficulty, d } = input
  if (!Array.isArray(jobDifficulty) || jobDifficulty.length < 1 || jobDifficulty.length > 12 || !jobDifficulty.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) throw new Error('jobDifficulty is a list of 1 to 12 integers from 0 to 100.')
  if (!Number.isInteger(d) || d < 1 || d > 10) throw new Error('d is an integer from 1 to 10.')
  return { jobDifficulty, d }
}

const INF = Infinity
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = s => ({ activeLine: L(s), pythonLine: P(s) })

export function buildTrace({ jobDifficulty, d }) {
  const n = jobDifficulty.length
  const cell = v => (v === INF ? null : v)
  const snap = (day, previous, current, extra = {}) => ({
    jobs: jobDifficulty, day, previous: previous.map(cell), current: current ? current.map(cell) : null, ...extra,
  })
  const frames = []

  if (d > n) {
    frames.push({ phase: 'start', ...at('if d > n'), message: `There are ${n} jobs for ${d} days. Every day needs at least one job, so no schedule exists.`, snapshot: snap(0, [0, ...Array(n).fill(INF)], null) })
    frames.push({ phase: 'done', ...at('return previous[n]'), message: 'Return -1.', snapshot: snap(0, [0, ...Array(n).fill(INF)], null, { result: -1 }) })
    return { input: { jobDifficulty, d }, result: -1, frames }
  }

  let previous = [0, ...Array(n).fill(INF)]
  frames.push({ phase: 'start', ...at('previous = ['), message: `Zero jobs cost 0. Build ${d} day block(s) on top of this table, one day at a time.`, snapshot: snap(0, previous, null) })

  for (let day = 1; day <= d; day++) {
    const current = Array(n + 1).fill(INF)
    frames.push({ phase: 'split', ...at('for day'), message: `Day ${day}: every prefix of jobs assigned to this day ends in a block. A prefix of length end needs at least ${day} job(s).`, snapshot: snap(day, previous, current) })
    for (let end = day; end <= n; end++) {
      let hardest = 0
      let bestStart = -1
      let bestHardest = 0
      for (let start = end - 1; start >= day - 1; start--) {
        hardest = Math.max(hardest, jobDifficulty[start])
        const candidate = previous[start] + hardest
        if (candidate < current[end]) { current[end] = candidate; bestStart = start; bestHardest = hardest }
      }
      frames.push({
        phase: 'update', ...at('current[end] = min'),
        message: `First ${end} job(s) with ${day} day(s): the last block starts at job ${bestStart + 1}. Its maximum is ${bestHardest}, so the cost is ${previous[bestStart]} + ${bestHardest} = ${current[end]}.`,
        snapshot: snap(day, previous, current, { end, start: bestStart }),
      })
    }
    previous = current
  }

  const result = previous[n] === INF ? -1 : previous[n]
  frames.push({ phase: 'done', ...at('return previous[n]'), message: `All ${n} jobs over ${d} day(s) cost ${result}.`, snapshot: snap(d, previous, null, { result }) })
  return { input: { jobDifficulty, d }, result, frames }
}

export const code = `minimum difficulty (job_difficulty, d):
  n = number of jobs
  if d > n: return -1
  previous = [0, inf, inf, ...]          // zero jobs cost 0
  for day from 1 to d:
    current = all inf
    for end from day to n:
      hardest = 0
      for start from end - 1 down to day - 1:
        hardest = max(hardest, job_difficulty[start])
        current[end] = min(current[end], previous[start] + hardest)
    previous = current
  return previous[n] or -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_difficulty(job_difficulty, d):
    n = len(job_difficulty)
    if d > n:
        return -1
    previous = [0] + [INF] * n
    for day in range(1, d + 1):
        current = [INF] * (n + 1)
        for end in range(day, n + 1):
            hardest = 0
            for start in range(end - 1, day - 2, -1):
                hardest = max(hardest, job_difficulty[start])
                current[end] = min(current[end], previous[start] + hardest)
        previous = current
    return previous[n] if previous[n] < INF else -1
`
