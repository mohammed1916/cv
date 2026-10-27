export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.startTime) || !Array.isArray(obj.endTime) || !Array.isArray(obj.profit)) {
    throw new Error('Use {"startTime": [...], "endTime": [...], "profit": [...]} with equal-length arrays.')
  }
  const n = obj.startTime.length
  if (n < 1 || n > 10) throw new Error('Use 1 to 10 jobs.')
  if (obj.endTime.length !== n || obj.profit.length !== n) throw new Error('startTime, endTime and profit must have the same length.')
  for (let i = 0; i < n; i++) {
    const s = obj.startTime[i]
    const e = obj.endTime[i]
    const p = obj.profit[i]
    if (![s, e, p].every(Number.isInteger)) throw new Error('Times and profits are integers.')
    if (s < 0 || e > 20 || s >= e) throw new Error('Each job needs 0 <= start < end <= 20.')
    if (p < 1 || p > 100) throw new Error('Each profit is an integer from 1 to 100.')
  }
  return { startTime: obj.startTime, endTime: obj.endTime, profit: obj.profit }
}

export function buildTrace(input) {
  const { startTime, endTime, profit } = input
  const jobs = startTime.map((start, i) => ({ start, end: endTime[i], profit: profit[i] })).sort((a, b) => a.end - b.end)
  const n = jobs.length
  const best = [0]
  const frames = [{ phase: 'start', activeLine: L('sort jobs by end'), k: 0, p: null, take: null, skip: null, best: [0], message: 'Sort the jobs by end time. best[k] is the most profit from the first k jobs.' }]
  for (let k = 1; k <= n; k++) {
    const job = jobs[k - 1]
    let p = 0
    while (p < k - 1 && jobs[p].end <= job.start) p++
    const take = job.profit + best[p]
    const skip = best[k - 1]
    best[k] = Math.max(take, skip)
    frames.push({ phase: 'job', activeLine: L('set best[k]'), k, p, take, skip, best: best.slice(), jobs: jobs.slice(0, k), message: `Job ${k} (${job.start} to ${job.end}, profit ${job.profit}): ${p} earlier jobs end by its start. Take ${take}, skip ${skip}, keep ${best[k]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best[n]'), k: n, p: null, take: null, skip: null, best: best.slice(), message: `Maximum profit: ${best[n]}.` })
  return { input, jobs, result: best[n], frames }
}

export const code = `maximum profit from non-overlapping jobs:
  sort jobs by end time
  set best[0] to 0
  for k from 1 to the number of jobs:
    let job be the k-th job in sorted order
    count p, the earlier jobs that end by the start of job
    take = profit of job + best[p]
    skip = best[k - 1]
    set best[k] to the larger of take and skip
  return best[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def job_scheduling(startTime, endTime, profit):
    jobs = sorted(zip(endTime, startTime, profit))
    n = len(jobs)
    best = [0] * (n + 1)
    for k in range(1, n + 1):
        end, start, value = jobs[k - 1]
        p = 0
        while p < k - 1 and jobs[p][0] <= start:
            p += 1
        best[k] = max(best[k - 1], value + best[p])
    return best[n]
`
