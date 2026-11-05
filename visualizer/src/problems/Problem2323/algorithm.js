// LeetCode 2323: Find Minimum Time to Finish All Jobs II.
// Each job gets its own worker, and worker w takes ceil(job / speed) time. Pairing the k-th smallest job
// with the k-th smallest speed is optimal: ceil(job / speed) grows with the job and shrinks with the speed,
// so matching sorted order never makes the largest completion time worse.

const MAX_N = 6
const MAX_VALUE = 100

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Use an object like {"jobs":[5,7,9],"workers":[2,3,4]}.') }
  const { jobs, workers } = input || {}
  if (!Array.isArray(jobs) || !Array.isArray(workers) || jobs.length !== workers.length) throw new Error('jobs and workers are lists of equal length.')
  if (jobs.length < 1 || jobs.length > MAX_N) throw new Error(`Use 1 to ${MAX_N} jobs. The visualization caps the count at ${MAX_N}.`)
  for (const v of [...jobs, ...workers]) if (!Number.isInteger(v) || v < 1 || v > MAX_VALUE) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return { jobs, workers }
}

export const code = `function minTime(jobs, workers) {
  const sortedJobs = [...jobs].sort((a, b) => a - b);
  const sortedSpeeds = [...workers].sort((a, b) => a - b);
  let answer = 0;
  for (let i = 0; i < sortedJobs.length; i++) {
    const time = Math.ceil(sortedJobs[i] / sortedSpeeds[i]);
    answer = Math.max(answer, time);
  }
  return answer;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_time(jobs, workers):
    sorted_jobs = sorted(jobs)
    sorted_speeds = sorted(workers)
    answer = 0
    for job, speed in zip(sorted_jobs, sorted_speeds):
        time = (job + speed - 1) // speed
        answer = max(answer, time)
    return answer
`

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

export const phases = [
  { id: 'sort', label: 'Sort', description: 'Sort jobs and worker speeds.' },
  { id: 'pair', label: 'Pair', description: 'Pair the k-th job with the k-th speed and time it.' },
  { id: 'done', label: 'Result', description: 'The largest completion time.' },
]

export function buildTrace({ jobs, workers }) {
  const sortedJobs = [...jobs].sort((a, b) => a - b)
  const sortedSpeeds = [...workers].sort((a, b) => a - b)
  const frames = []
  frames.push({ phase: 'sort', activeLine: L('const sortedJobs = '), pythonLine: P('sorted_jobs = sorted(jobs)'), message: `Jobs ${sortedJobs.join(', ')}; speeds ${sortedSpeeds.join(', ')}.`, index: -1, rows: [], answer: 0 })
  const rows = []
  let answer = 0
  sortedJobs.forEach((job, i) => {
    const speed = sortedSpeeds[i]
    const time = Math.ceil(job / speed)
    answer = Math.max(answer, time)
    rows.push({ job, speed, time })
    frames.push({ phase: 'pair', activeLine: L('const time = Math.ceil'), pythonLine: P('time = (job + speed - 1)'), message: `Job ${job} with speed ${speed} takes ${time}. Largest so far ${answer}.`, index: i, rows: rows.slice(), answer })
  })
  frames.push({ phase: 'done', activeLine: L('return answer;'), pythonLine: P('return answer'), message: `The minimum possible finish time is ${answer}.`, index: sortedJobs.length, rows: rows.slice(), answer })
  return { input: { jobs, workers }, result: answer, frames }
}
