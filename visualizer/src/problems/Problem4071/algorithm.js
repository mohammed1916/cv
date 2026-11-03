// Reversing the suffix from position k dials s[n-1], s[n-2], ..., s[k] after the prefix s[0..k-1].
// The suffix's internal cost is unchanged by reversal (the same neighbour pairs appear), so only the link
// from the prefix's last digit into s[n-1] changes. Precompute suffix costs, then sweep k once.

const MAX_LENGTH = 30

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

export function parseInput(text) {
  const trimmed = text.trim()
  const s = /^".*"$/.test(trimmed) ? JSON.parse(trimmed) : trimmed
  if (typeof s !== 'string' || !/^\d{1,30}$/.test(s)) throw new Error('Enter 1 to 30 decimal digits, with or without quotes.')
  return s
}

export function circularCost(a, b) {
  const diff = Math.abs(a - b)
  return Math.min(diff, 10 - diff)
}

export function reversedFrom(s, k) {
  return s.slice(0, k) + s.slice(k).split('').reverse().join('')
}

export function buildTrace(s) {
  const n = s.length
  const digits = [...s].map(Number)
  const suffix = new Array(n).fill(0)
  for (let k = n - 2; k >= 0; k--) suffix[k] = suffix[k + 1] + circularCost(digits[k], digits[k + 1])
  const frames = []
  frames.push({
    phase: 'suffix', activeLine: L('suffix[k] ← cost of dialing'), pythonLine: P('suffix[k] = suffix[k + 1]'),
    k: -1, candidate: null, best: null, bestK: null, prefixCost: 0, preview: s, suffix: [...suffix], message: `Suffix costs inside each tail are ready. Dialing without reversal is the baseline.`,
  })
  let best = null
  let bestK = null
  let prefixCost = 0
  let prev = 0
  for (let k = 0; k < n; k++) {
    const candidate = prefixCost + circularCost(prev, digits[n - 1]) + suffix[k]
    if (best === null || candidate < best) {
      best = candidate
      bestK = k
    }
    frames.push({
      phase: 'candidate', activeLine: L('candidate ← prefixCost'), pythonLine: P('candidate = prefix_cost'),
      k, candidate, best, bestK, prefixCost, preview: reversedFrom(s, k), suffix: [...suffix],
      message: `Reverse from position ${k}: ${prefixCost} to reach the prefix, then ${candidate - prefixCost} for the reversed tail. Candidate ${candidate}.`,
    })
    prefixCost += circularCost(prev, digits[k])
    prev = digits[k]
  }
  if (prefixCost < best) {
    best = prefixCost
    bestK = n
  }
  frames.push({
    phase: 'keep', activeLine: L('(no reversal)'), pythonLine: P('return min(best, prefix_cost)'),
    k: n, candidate: prefixCost, best, bestK, prefixCost, preview: s, suffix: [...suffix],
    message: `Dialing the string unchanged costs ${prefixCost}. The best option costs ${best}.`,
  })
  frames.push({
    phase: 'done', activeLine: L('RETURN best'), pythonLine: P('return min(best, prefix_cost)'),
    k: -1, candidate: null, best, bestK, prefixCost, preview: bestK === n || bestK === null ? s : reversedFrom(s, bestK), suffix: [...suffix],
    message: `Minimum total rotation steps: ${best}.`,
  })
  return { input: s, result: best, frames }
}

export const code = `FUNCTION minRotationsWithReversal(s)
    n ← length of s
    suffix[k] ← cost of dialing s[k..n-1] between neighbours, from the end back to 0
    best ← none; prefixCost ← 0; prev ← 0
    FOR each position k from 0 to n − 1
        candidate ← prefixCost + cost(prev, s[n-1]) + suffix[k]
        best ← smaller of best and candidate
        prefixCost ← prefixCost + cost(prev, s[k]); prev ← s[k]
    best ← smaller of best and prefixCost (no reversal)
    RETURN best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_rotations_with_reversal(s):
    n = len(s)
    digits = [int(ch) for ch in s]

    def cost(a, b):
        diff = abs(a - b)
        return min(diff, 10 - diff)

    suffix = [0] * n
    for k in range(n - 2, -1, -1):
        suffix[k] = suffix[k + 1] + cost(digits[k], digits[k + 1])
    best = None
    prefix_cost = 0
    prev = 0
    for k in range(n):
        candidate = prefix_cost + cost(prev, digits[-1]) + suffix[k]
        best = candidate if best is None else min(best, candidate)
        prefix_cost += cost(prev, digits[k])
        prev = digits[k]
    return min(best, prefix_cost)


if __name__ == "__main__":
    import sys
    text = sys.stdin.read().strip()
    if text.startswith('"'):
        import json
        text = json.loads(text)
    print(min_rotations_with_reversal(text))
`
