export const phases = [
  { id: 'start', label: 'Empty road', description: 'With no points reached, earnings are zero.' },
  { id: 'point', label: 'Reach point x', description: 'Either skip the step into x, or finish a ride that ends at x and continue from its start.' },
  { id: 'ride', label: 'Ride ending here', description: 'A ride from start to x earns its distance plus its tip, on top of the best earnings at its start.' },
  { id: 'done', label: 'Result', description: 'The best earnings by point n is the answer.' },
]

export const code = `function maxTaxiEarnings(n, rides) {
  const endingAt = Array.from({ length: n + 1 }, () => [])
  for (const [start, end, tip] of rides) endingAt[end].push([start, tip])
  const best = new Array(n + 1).fill(0)
  for (let x = 1; x <= n; x++) {
    best[x] = best[x - 1]
    for (const [start, tip] of endingAt[x]) {
      best[x] = Math.max(best[x], best[start] + (x - start) + tip)
    }
  }
  return best[n]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_taxi_earnings(n, rides):
    ending_at = [[] for _ in range(n + 1)]
    for start, end, tip in rides:
        ending_at[end].append((start, tip))
    best = [0] * (n + 1)
    for x in range(1, n + 1):
        best[x] = best[x - 1]
        for start, tip in ending_at[x]:
            best[x] = max(best[x], best[start] + (x - start) + tip)
    return best[n]
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"n":5,"rides":[[2,5,4],[1,5,1]]}.') }
  const { n, rides } = obj || {}
  if (!Number.isInteger(n) || n < 2 || n > 20) throw new Error('n must be a whole number from 2 to 20 here.')
  if (!Array.isArray(rides) || rides.length < 1 || rides.length > 12) throw new Error('Give 1 to 12 rides.')
  for (const r of rides) {
    if (!Array.isArray(r) || r.length !== 3 || !Number.isInteger(r[0]) || !Number.isInteger(r[1]) || !Number.isInteger(r[2])) throw new Error('Each ride is [start, end, tip].')
    if (r[0] < 1 || r[1] > n || r[0] >= r[1] || r[2] < 0) throw new Error('Each ride needs 1 <= start < end <= n and tip >= 0.')
  }
  return { n, rides }
}

export function buildTrace({ n, rides }) {
  const frames = []
  const endingAt = Array.from({ length: n + 1 }, () => [])
  for (const [start, end, tip] of rides) endingAt[end].push([start, tip])
  const best = new Array(n + 1).fill(0)
  const add = (phase, c, p, message, x, chosen) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { n, rides, x, best: best.slice(), chosen },
  })
  add('start', 'const best = new Array', 'best = [0]', 'Earnings by point 0 are zero.', 0, null)
  for (let x = 1; x <= n; x++) {
    best[x] = best[x - 1]
    add('point', 'best[x] = best[x - 1]', 'best[x] = best[x - 1]', `Point ${x}: carrying over ${best[x]} from point ${x - 1}.`, x, null)
    for (const [start, tip] of endingAt[x]) {
      const value = best[start] + (x - start) + tip
      if (value > best[x]) {
        best[x] = value
        add('ride', 'best[x] = Math.max', 'best[x] = max', `Ride ${start} → ${x} earns ${x - start} + tip ${tip}, total ${value}.`, x, [start, x])
      }
    }
  }
  add('done', 'return best[n]', 'return best[n]', `Maximum earnings: ${best[n]}.`, n, null)
  return { input: { n, rides }, result: best[n], frames }
}
