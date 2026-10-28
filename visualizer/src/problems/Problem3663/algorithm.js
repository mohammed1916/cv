export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Number.isInteger(data.n) || data.n < 1 || data.n > 1000000000) throw new Error('Use an integer n from 1 to 1000000000.')
  return { n: data.n }
}

export function buildTrace({ n }) {
  const digits = String(n)
  const counts = new Map()
  const sorted = () => [...counts].sort((a, b) => a[0] - b[0])
  const frames = [{ phase: 'start', activeLine: L('write n as'), index: -1, counts: [], key: null, best: null, message: `Write ${n} as its decimal digits.` }]
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[i])
    counts.set(d, (counts.get(d) || 0) + 1)
    frames.push({ phase: 'count', activeLine: L('count how many times'), index: i, counts: sorted(), key: d, best: null, message: `Digit ${d} has now appeared ${counts.get(d)} time(s).` })
  }
  let best = null
  for (const [d, count] of sorted()) {
    if (best === null || count < counts.get(best)) best = d
    frames.push({ phase: 'compare', activeLine: L('if best is nothing'), index: -1, counts: sorted(), key: d, best, message: `Digit ${d} appears ${count} time(s); the best digit so far is ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, counts: sorted(), key: best, best, result: best, message: `The least frequent digit is ${best}.` })
  return { input: { n }, result: best, frames }
}

export const code = `least frequent digit of n
  write n as its decimal digits
  count how many times each digit appears
  set best to nothing
  for each digit that appears, from smallest to largest
    if best is nothing or the count of this digit is less than the count of best then
      set best to this digit
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def least_frequent_digit(n):
    counts = {}
    for ch in str(n):
        d = int(ch)
        counts[d] = counts.get(d, 0) + 1
    best = None
    for d in sorted(counts):
        if best is None or counts[d] < counts[best]:
            best = d
    return best
`
