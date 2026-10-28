export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.jobs) || input.jobs.length < 1 || input.jobs.length > 8) throw new Error('Use {"jobs": [...], "k": n} with 1 to 8 jobs.')
  if (input.jobs.some(v => !Number.isInteger(v) || v < 1 || v > 60)) throw new Error('Each job time is an integer from 1 to 60.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > Math.min(3, input.jobs.length)) throw new Error('k is an integer from 1 to 3 and no larger than the number of jobs.')
  return { jobs: input.jobs, k: input.k }
}

export function buildTrace({ jobs, k }) {
  const sorted = [...jobs].sort((a, b) => b - a)
  const loads = Array(k).fill(0)
  let best = null
  const frames = [{ phase: 'start', activeLine: L('set best to infinity'), job: null, loads: [...loads], best, message: 'Every worker starts empty. Jobs are tried largest first.' }]
  const place = index => {
    if (index === sorted.length) {
      const peak = Math.max(...loads)
      if (best === null || peak < best) {
        best = peak
        frames.push({ phase: 'improve', activeLine: L('set best to the peak'), job: null, loads: [...loads], best, message: `All jobs placed with peak ${peak}, a new best.` })
      }
      return
    }
    for (let w = 0; w < k; w++) {
      if (loads.slice(0, w).includes(loads[w])) continue
      if (best !== null && loads[w] + sorted[index] >= best) continue
      loads[w] += sorted[index]
      frames.push({ phase: 'assign', activeLine: L('add this job to the worker'), job: index, loads: [...loads], best, message: `Give job ${sorted[index]} to worker ${w + 1}.` })
      place(index + 1)
      loads[w] -= sorted[index]
    }
  }
  place(0)
  frames.push({ phase: 'done', activeLine: L('return best'), job: null, loads: [...loads], best, message: `Smallest possible peak: ${best}.` })
  return { input: { jobs, k }, sorted, result: best, frames }
}

export const code = `smallest possible peak working time
  sort the jobs from largest to smallest
  set best to infinity
  call place on the first job with every worker empty
  return best

place(job)
  if every job is placed then
    set best to the peak load if the peak is below best
    stop
  for each worker
    skip the worker if an earlier worker has the same load
    skip the worker if its load plus this job reaches best
    add this job to the worker and call place on the next job
    take this job back off the worker`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_time_required(jobs, k):
    sorted_jobs = sorted(jobs, reverse=True)
    loads = [0] * k
    best = float('inf')

    def place(index):
        nonlocal best
        if index == len(sorted_jobs):
            best = min(best, max(loads))
            return
        for worker in range(k):
            if loads[worker] in loads[:worker]:
                continue
            if loads[worker] + sorted_jobs[index] >= best:
                continue
            loads[worker] += sorted_jobs[index]
            place(index + 1)
            loads[worker] -= sorted_jobs[index]

    place(0)
    return best
`
