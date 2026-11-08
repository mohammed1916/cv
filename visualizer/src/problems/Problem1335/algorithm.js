export const phases = [
  { id: 'start', label: 'Start', description: 'Row 0 of the table says zero jobs are done before any day starts. Every other cell is unreachable for now.' },
  { id: 'day', label: 'Next day', description: 'Each row adds one more working day; the day must finish at least one job.' },
  { id: 'cell', label: 'Fill cell', description: 'dp[day][i] tries every split point j: the earlier days finish jobs 0 to j-1, and day finishes jobs j to i-1 at the hardest job in that block.' },
  { id: 'done', label: 'Complete', description: 'The last cell is the minimum total difficulty.' },
]

export const examples = [
  { label: 'Three days, six jobs', input: '{"jobDifficulty":[6,5,4,3,2,1],"d":3}' },
  { label: 'Equal days', input: '{"jobDifficulty":[9,9,9],"d":3}' },
  { label: 'One day', input: '{"jobDifficulty":[1,2,3],"d":1}' },
    { label: "Single job", input: "{\"jobDifficulty\":[7],\"d\":1}" },
    { label: "Equal difficulties", input: "{\"jobDifficulty\":[3,3,3,3],\"d\":2}" },
    { label: "One job per day, extremes", input: "{\"jobDifficulty\":[1,1000,0],\"d\":3}" },
    { label: "Long run: twelve jobs, six days", input: "{\"jobDifficulty\":[345,516,459,281,346,553,558,656,950,219,252,829],\"d\":6}" },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with jobDifficulty and d, such as {"jobDifficulty":[6,5,4],"d":2}.')
  if (!Array.isArray(data.jobDifficulty) || data.jobDifficulty.length < 1 || data.jobDifficulty.length > 12) throw new Error('jobDifficulty must list 1 to 12 jobs in this visualization.')
  if (!data.jobDifficulty.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) throw new Error('Every job difficulty is an integer from 0 to 1000.')
  if (!Number.isInteger(data.d) || data.d < 1 || data.d > 6) throw new Error('d is an integer from 1 to 6 in this visualization.')
  return { jobDifficulty: data.jobDifficulty, d: data.d }
}

export function buildTrace({ jobDifficulty, d }) {
  const n = jobDifficulty.length
  if (n < d) {
    return { input: { jobDifficulty, d }, result: -1, frames: [{ phase: 'start', activeLine: L('if (n < d)'), pythonLine: P('if n < d'), snapshot: { table: [], day: 0 },
      message: `There are ${n} jobs for ${d} days, so each day cannot get a job. Return -1.` }, { phase: 'done', activeLine: L('return -1'), pythonLine: P('return -1'), snapshot: { table: [], day: 0 }, message: 'Return -1.', result: -1 }] }
  }
  const INF = Infinity
  const table = Array.from({ length: d + 1 }, () => Array(n + 1).fill(INF))
  table[0][0] = 0
  const show = () => table.map(row => row.map(v => (v === INF ? '∞' : v)))
  const snap = (day, cell) => ({ table: show(), day, cell })
  const frames = [{ phase: 'start', activeLine: L('const table = '), pythonLine: P('table = '), snapshot: snap(0, { row: 0, column: 0 }),
    message: `Row 0, column 0 is 0: no jobs, no days. Fill ${d} rows for ${n} jobs.` }]
  for (let day = 1; day <= d; day++) {
    frames.push({ phase: 'day', activeLine: L('for (let day = 1'), pythonLine: P('for day in range'), snapshot: snap(day, null),
      message: `Day ${day}: each cell needs at least ${day} job(s) in total.` })
    for (let i = day; i <= n; i++) {
      let hardest = 0
      for (let j = i - 1; j >= day - 1; j--) {
        hardest = Math.max(hardest, jobDifficulty[j])
        table[day][i] = Math.min(table[day][i], table[day - 1][j] + hardest)
      }
      frames.push({ phase: 'cell', activeLine: L('table[day][i] = Math.min'), pythonLine: P('cur[i] = min'), snapshot: snap(day, { row: day, column: i }),
        message: `dp[${day}][${i}] = ${table[day][i] === INF ? 'unreachable' : table[day][i]}: the best split of the first ${i} jobs into ${day} day(s).` })
    }
  }
  const result = table[d][n]
  frames.push({ phase: 'done', activeLine: L('return table[d][n]'), pythonLine: P('return prev[n]'), snapshot: snap(d, { row: d, column: n }),
    message: `Return ${result}, the minimum total difficulty.`, result })
  return { input: { jobDifficulty, d }, result, frames }
}

export const code = `function minDifficulty(jobDifficulty, d) {
  const n = jobDifficulty.length
  if (n < d) return -1
  const table = Array.from({ length: d + 1 }, () => Array(n + 1).fill(Infinity))
  table[0][0] = 0
  for (let day = 1; day <= d; day++) {
    for (let i = day; i <= n; i++) {
      let hardest = 0
      for (let j = i - 1; j >= day - 1; j--) {
        hardest = Math.max(hardest, jobDifficulty[j])
        table[day][i] = Math.min(table[day][i], table[day - 1][j] + hardest)
      }
    }
  }
  return table[d][n]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_difficulty(job_difficulty, d):
    n = len(job_difficulty)
    if n < d:
        return -1
    table = [[float('inf')] * (n + 1) for _ in range(d + 1)]
    table[0][0] = 0
    for day in range(1, d + 1):
        for i in range(day, n + 1):
            hardest = 0
            for j in range(i - 1, day - 2, -1):
                hardest = max(hardest, job_difficulty[j])
                table[day][i] = min(table[day][i], table[day - 1][j] + hardest)
    return table[d][n]
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
