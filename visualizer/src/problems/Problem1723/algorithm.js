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
  const frames = [{ phase: 'start', pythonLine: 4, activeLine: L('let best = Infinity'), job: null, loads: [...loads], best, message: 'Every worker starts empty. Jobs are tried largest first.' }]
  const place = index => {
    if (index === sorted.length) {
      const peak = Math.max(...loads)
      if (best === null || peak < best) {
        best = peak
        frames.push({ phase: 'improve', pythonLine: 9, activeLine: L('best = Math.min(best'), job: null, loads: [...loads], best, message: `All jobs placed with peak ${peak}, a new best.` })
      }
      return
    }
    for (let w = 0; w < k; w++) {
      if (loads.slice(0, w).includes(loads[w])) continue
      if (best !== null && loads[w] + sorted[index] >= best) continue
      loads[w] += sorted[index]
      frames.push({ phase: 'assign', pythonLine: 16, activeLine: L('loads[w] += sorted[index]'), job: index, loads: [...loads], best, message: `Give job ${sorted[index]} to worker ${w + 1}.` })
      place(index + 1)
      loads[w] -= sorted[index]
    }
  }
  place(0)
  frames.push({ phase: 'done', pythonLine: 21, activeLine: L('return best'), job: null, loads: [...loads], best, message: `Smallest possible peak: ${best}.` })
  return { input: { jobs, k }, sorted, result: best, frames }
}

export const code = `function minimumPeakWorkingTime(jobs, k) {
  const sorted = [...jobs].sort((a, b) => b - a)
  const loads = Array(k).fill(0)
  let best = Infinity
  const place = index => {
    if (index === sorted.length) {
      best = Math.min(best, Math.max(...loads))
      return
    }
    for (let w = 0; w < k; w++) {
      if (loads.slice(0, w).includes(loads[w])) continue
      if (loads[w] + sorted[index] >= best) continue
      loads[w] += sorted[index]
      place(index + 1)
      loads[w] -= sorted[index]
    }
  }
  place(0)
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_peak_working_time(jobs, k):
    sorted_jobs = sorted(jobs, reverse=True)
    loads = [0] * k
    best = float('inf')

    def place(index):
        nonlocal best
        if index == len(sorted_jobs):
            best = min(best, max(loads))
            return
        for w in range(k):
            if loads[w] in loads[:w]:
                continue
            if loads[w] + sorted_jobs[index] >= best:
                continue
            loads[w] += sorted_jobs[index]
            place(index + 1)
            loads[w] -= sorted_jobs[index]

    place(0)
    return best
`
