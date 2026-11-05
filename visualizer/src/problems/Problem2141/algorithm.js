// LeetCode 2141: Maximum Running Time of N Computers.
// Binary search on the running time T. T minutes are achievable when the batteries, each capped at T,
// hold at least n * T minutes in total: batteries can be swapped freely, so no single battery needs to
// give more than T minutes to one computer.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"n":2,"batteries":[3,3,3]}.') }
  const { n, batteries } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 20) throw new Error('n is an integer from 1 to 20.')
  if (!Array.isArray(batteries) || batteries.length < 1 || batteries.length > 40 || batteries.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) {
    throw new Error('batteries holds 1 to 40 integers from 1 to 100000.')
  }
  return { n, batteries }
}

export const code = `function maxRunTime(n, batteries) {
  const total = batteries.reduce((sum, b) => sum + b, 0)
  let lo = 0
  let hi = Math.floor(total / n)
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2)
    const usable = batteries.reduce((sum, b) => sum + Math.min(b, mid), 0)
    if (usable >= n * mid) lo = mid
    else hi = mid - 1
  }
  return lo
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: max_run_time
def max_run_time(n, batteries):
    total = sum(batteries)
    lo = 0
    hi = total // n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        usable = sum(min(b, mid) for b in batteries)
        if usable >= n * mid:
            lo = mid
        else:
            hi = mid - 1
    return lo
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
  { id: 'range', label: 'Search range', description: 'The answer lies between 0 and the total divided by n.' },
  { id: 'probe', label: 'Test middle', description: 'Can every computer run for the middle time?' },
  { id: 'feasible', label: 'Feasible', description: 'The middle time works, so the answer is at least that.' },
  { id: 'infeasible', label: 'Too long', description: 'The middle time fails, so the answer is below it.' },
  { id: 'done', label: 'Result', description: 'The largest feasible time.' },
]

export function buildTrace({ n, batteries }) {
  const frames = []
  const total = batteries.reduce((sum, b) => sum + b, 0)
  let lo = 0
  let hi = Math.floor(total / n)
  const usableAt = t => batteries.reduce((sum, b) => sum + Math.min(b, t), 0)
  frames.push({ phase: 'range', activeLine: L('let hi = Math.floor'), pythonLine: P('hi = total'), message: `Answer between ${lo} and ${hi}.`, lo, hi, probe: null, verdict: null, need: null, usable: null })
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2)
    const usable = usableAt(mid)
    const ok = usable >= n * mid
    frames.push({ phase: ok ? 'feasible' : 'infeasible', activeLine: L('if (usable >= n * mid)'), pythonLine: P('if usable >= n * mid'), message: `Test ${mid}: capped batteries give ${usable} minutes, need ${n * mid}. ${ok ? 'Feasible.' : 'Not feasible.'}`, lo, hi, probe: mid, verdict: ok, need: n * mid, usable })
    if (ok) lo = mid
    else hi = mid - 1
  }
  frames.push({ phase: 'done', activeLine: L('return lo'), pythonLine: P('return lo'), message: `Maximum running time: ${lo} minutes.`, lo, hi: lo, probe: null, verdict: null, need: null, usable: null })
  return { input: { n, batteries }, result: lo, frames }
}
