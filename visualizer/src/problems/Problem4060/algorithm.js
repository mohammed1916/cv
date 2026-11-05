const PHASES = [
  { id: 'table', label: 'Table', description: 'Count digit strings of each length by parity of their even digits.' },
  { id: 'shorter', label: 'Shorter', description: 'Add every shorter positive number that qualifies.' },
  { id: 'walk', label: 'Walk', description: 'Walk the digits of the bound, adding smaller prefixes that qualify.' },
  { id: 'self', label: 'Bound', description: 'Add the bound itself when it qualifies.' },
  { id: 'done', label: 'Answer', description: 'Subtract the count below l from the count up to r.' },
]

export const phases = PHASES

export const code = `function countEvenlyGood(l, r) {
  // ways[len][p] is the number of digit strings of length len whose even-digit count has parity p
  const ways = Array.from({ length: 20 }, () => [0, 0])
  ways[0][0] = 1
  for (let n = 1; n < 20; n++) {
    for (let p = 0; p < 2; p++) ways[n][p] = 5 * ways[n - 1][p] + 5 * ways[n - 1][p ^ 1]
  }
  function count(N) {
    if (N <= 0) return 0
    const digits = String(N).split('').map(Number)
    const m = digits.length
    let total = 0
    // for each shorter length, a first digit 1 to 9 with the matching parity for the rest
    for (let len = 1; len < m; len++) {
      for (let f = 1; f <= 9; f++) total += ways[len - 1][f % 2 === 0 ? 1 : 0]
    }
    let p = 0
    for (let i = 0; i < m; i++) {
      // for each position i of N, add the smaller digits c that may appear there
      const rest = m - 1 - i
      for (let c = i === 0 ? 1 : 0; c < digits[i]; c++) total += ways[rest][p ^ (c % 2 === 0 ? 1 : 0)]
      p ^= digits[i] % 2 === 0 ? 1 : 0
    }
    if (p === 0) total += 1 // if p is zero, add N itself
    return total
  }
  return count(r) - count(l - 1)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `def count_evenly_good(l, r):
    ways = [[0, 0] for _ in range(20)]
    ways[0][0] = 1
    for n in range(1, 20):
        for p in range(2):
            ways[n][p] = 5 * ways[n - 1][p] + 5 * ways[n - 1][p ^ 1]

    def count(N):
        if N <= 0:
            return 0
        digits = [int(ch) for ch in str(N)]
        m = len(digits)
        total = 0
        for L in range(1, m):
            for f in range(1, 10):
                pf = 1 if f % 2 == 0 else 0
                total += ways[L - 1][pf]
        p = 0
        for i, d in enumerate(digits):
            rest = m - 1 - i
            for c in range(1 if i == 0 else 0, d):
                pc = p ^ (1 if c % 2 == 0 else 0)
                total += ways[rest][pc]
            p ^= 1 if d % 2 == 0 else 0
        if p == 0:
            total += 1
        return total

    return count(r) - count(l - 1)
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with l and r.')
  const { l, r } = input
  if (!Number.isInteger(l) || !Number.isInteger(r) || l < 1 || r < l || r > 1000000000000000) {
    throw new Error('Use integers with 1 <= l <= r <= 10^12.')
  }
  return { l, r }
}

const isEven = d => d % 2 === 0

export function buildTrace({ l, r }) {
  const ways = Array.from({ length: 20 }, () => [0, 0])
  ways[0][0] = 1
  for (let n = 1; n < 20; n++) for (let p = 0; p < 2; p++) ways[n][p] = 5 * ways[n - 1][p] + 5 * ways[n - 1][p ^ 1]
  const frames = []
  const base = { ways: ways.slice(0, 13).map(row => [...row]) }
  frames.push({ ...base, pythonLine: P('ways[0][0] = 1'), phase: 'table', activeLine: L('ways[len][p]'), bound: null, digits: [], pos: -1, p: 0, added: 0, total: 0, message: 'Build the parity table for digit strings of each length.' })
  let grand = 0
  const countWithFrames = (N, label) => {
    if (N <= 0) return 0
    const digits = String(N).split('').map(Number)
    const m = digits.length
    let total = 0
    for (let L2 = 1; L2 < m; L2++) {
      let added = 0
      for (let f = 1; f <= 9; f++) added += ways[L2 - 1][isEven(f) ? 1 : 0]
      total += added
      frames.push({ ...base, pythonLine: P('for L in range(1, m)'), phase: 'shorter', activeLine: L('for each shorter length, a first digit'), bound: N, digits, pos: -1, p: 0, added, total, message: `${label}: every ${L2 + 1}-digit number qualifies in ${added} way${added === 1 ? '' : 's'}.` })
    }
    let p = 0
    for (let i = 0; i < m; i++) {
      const d = digits[i]
      const rest = m - 1 - i
      let added = 0
      for (let c = i === 0 ? 1 : 0; c < d; c++) added += ways[rest][p ^ (isEven(c) ? 1 : 0)]
      total += added
      frames.push({ ...base, pythonLine: P('for c in range'), phase: 'walk', activeLine: L('for each position i of N'), bound: N, digits, pos: i, p, added, total, message: `${label}: position ${i} has digit ${d}; smaller digits add ${added}.` })
      p ^= isEven(d) ? 1 : 0
    }
    if (p === 0) {
      total += 1
      frames.push({ ...base, pythonLine: P('if p == 0'), phase: 'self', activeLine: L('if p is zero, add N'), bound: N, digits, pos: m, p, added: 1, total, message: `${label}: N itself has an even count of even digits, so it counts.` })
    } else {
      frames.push({ ...base, pythonLine: P('if p == 0'), phase: 'self', activeLine: L('if p is zero, add N'), bound: N, digits, pos: m, p, added: 0, total, message: `${label}: N itself does not qualify.` })
    }
    return total
  }
  const upper = countWithFrames(r, `count(${r})`)
  const lower = countWithFrames(l - 1, `count(${l - 1})`)
  grand = upper - lower
  frames.push({ ...base, pythonLine: P('return count(r) - count(l - 1)'), phase: 'done', activeLine: L('return count(r) - count(l - 1)'), bound: null, digits: [], pos: -1, p: 0, added: 0, total: grand, message: `${upper} minus ${lower} gives ${grand} qualifying integers in [${l}, ${r}].` })
  return { input: { l, r }, result: grand, frames }
}
