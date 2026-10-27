export function parseInput(text) {
  const d = JSON.parse(text)
  if (!d || !Array.isArray(d.difficulty) || !Array.isArray(d.profit) || !Array.isArray(d.worker)) throw new Error('Enter JSON like {"difficulty":[..],"profit":[..],"worker":[..]}.')
  if (!d.difficulty.length || d.difficulty.length !== d.profit.length || d.difficulty.length > 30 || !d.worker.length || d.worker.length > 30) throw new Error('Use 1-30 jobs (equal-length difficulty and profit) and 1-30 workers (visualization cap).')
  if ([...d.difficulty, ...d.profit, ...d.worker].some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('All values must be integers from 1 to 100,000.')
  return { difficulty: [...d.difficulty], profit: [...d.profit], worker: [...d.worker] }
}
export function buildTrace({ difficulty, profit, worker }) {
  const jobs = difficulty.map((d, i) => [d, profit[i]]).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const workers = [...worker].sort((a, b) => a - b)
  let best = 0, i = 0, total = 0
  const frames = [{ phase: 'start', w: -1, i: 0, best: 0, total: 0, activeLine: L('set jobs to'), message: `Sort ${jobs.length} jobs by difficulty and ${workers.length} workers by ability. Weaker workers can only use a prefix of the jobs.` }]
  workers.forEach((ability, w) => {
    while (i < jobs.length && jobs[i][0] <= ability) {
      const old = best
      best = Math.max(best, jobs[i][1])
      frames.push({ phase: 'absorb', w, i, best, total, activeLine: L('set best to the larger'),
        message: `Worker ability ${ability} can do job ${i} (difficulty ${jobs[i][0]}, profit ${jobs[i][1]}). Best profit ${best === old ? 'stays' : 'rises to'} ${best}.` })
      i++
    }
    total += best
    frames.push({ phase: 'pay', w, i, best, total, activeLine: L('add best to total'), message: `Worker ability ${ability} takes the best reachable profit ${best}. Total ${total}.` })
  })
  frames.push({ phase: 'done', w: workers.length - 1, i, best, total, activeLine: L('return total'), message: `Maximum total profit: ${total}.` })
  return { input: { difficulty, profit, worker }, jobs, workers, result: total, frames }
}
export const code = `set jobs to the pairs (difficulty[i], profit[i]), sorted by difficulty
set workers to the abilities sorted in increasing order
set best to 0, i to 0, and total to 0
for each ability in workers
  while i is less than the number of jobs and jobs[i] difficulty is at most ability
    set best to the larger of best and jobs[i] profit
    add 1 to i
  add best to total
return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_profit_assignment(difficulty, profit, worker):
    jobs = sorted(zip(difficulty, profit))
    best = i = total = 0
    for ability in sorted(worker):
        while i < len(jobs) and jobs[i][0] <= ability:
            best = max(best, jobs[i][1])
            i += 1
        total += best
    return total
`
