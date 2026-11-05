// LeetCode 1954: a square plot with half-side k holds 2k(k+1)(2k+1) apples, which grows with k. Binary search finds the smallest k that is enough; the perimeter is 8k.
const SOURCE = [
  "function minimumPerimeter(neededApples) {",
  "  const apples = k => 2 * k * (k + 1) * (2 * k + 1)",
  "  let lo = 1, hi = 100000",
  "  while (lo < hi) {",
  "    const mid = Math.floor((lo + hi) / 2)",
  "    if (apples(mid) >= neededApples) hi = mid",
  "    else lo = mid + 1",
  "  }",
  "  return 8 * lo",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_perimeter(needed_apples):
    def apples(k):
        return 2 * k * (k + 1) * (2 * k + 1)
    lo, hi = 1, 100000
    while lo < hi:
        mid = (lo + hi) // 2
        if apples(mid) >= needed_apples:
            hi = mid
        else:
            lo = mid + 1
    return 8 * lo
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }
const apples = k => 2 * k * (k + 1) * (2 * k + 1)
const MAX_K = 100000

export const phases = [
  { id: 'probe', label: 'Probe', description: 'Test the middle half-side k.' },
  { id: 'done', label: 'Result', description: 'Smallest k that holds enough apples, times eight.' },
]

export function parseInput(text) {
  const n = Number(String(text).trim())
  if (!Number.isInteger(n) || n < 1 || n > 1000000000) throw new Error('Enter an integer from 1 to 1000000000.')
  return { needed: n }
}

export function buildTrace({ needed }) {
  const frames = []
  let lo = 1, hi = MAX_K
  frames.push({ phase: 'probe', activeLine: L('let lo = 1'), pythonLine: P('lo, hi ='), message: `Search half-sides from ${lo} to ${hi}.`, lo, hi, mid: null, total: null, verdict: null })
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const total = apples(mid)
    const ok = total >= needed
    frames.push({ phase: 'probe', activeLine: L(ok ? 'hi = mid' : 'lo = mid + 1'), pythonLine: P(ok ? 'hi = mid' : 'lo = mid + 1'), message: `k = ${mid} holds ${total} apples: ${ok ? 'enough, so the answer is at most k.' : 'not enough, so the answer is above k.'}`, lo, hi, mid, total, verdict: ok })
    if (ok) hi = mid
    else lo = mid + 1
  }
  const result = 8 * lo
  frames.push({ phase: 'done', activeLine: L('return 8 * lo'), pythonLine: P('return 8 * lo'), message: `Smallest half-side ${lo}: perimeter ${result}.`, lo, hi, mid: null, total: apples(lo), verdict: true, result })
  return { input: { needed }, result, frames }
}
