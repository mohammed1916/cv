export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.low) || !Number.isInteger(input.high)) throw new Error('Use a JSON object with integers low and high.')
  const { low, high } = input
  if (low < 1 || high < low || high > 3000) throw new Error('Use 1 <= low <= high <= 3000 (visualization cap).')
  if (high - low > 300) throw new Error('The visualization checks at most 301 numbers at a time.')
  return input
}

const balanced = x => {
  const s = String(x)
  if (s.length < 2) return false
  let odd = 0
  let even = 0
  for (let i = 0; i < s.length; i++) {
    if (i % 2 === 0) odd += Number(s[i])
    else even += Number(s[i])
  }
  return odd === even
}

export function buildTrace(input) {
  const { low, high } = input
  const flags = []
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('count = 0'), offset: -1, value: null, count, message: `Check each integer from ${low} to ${high}.` }]
  for (let x = low; x <= high; x++) {
    const ok = balanced(x)
    flags.push(ok)
    if (ok) count++
    frames.push({ phase: 'check', activeLine: L('split x into its digits'), offset: x - low, value: x, count, message: ok ? `${x} is balanced. Count: ${count}.` : `${x} is not balanced.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), offset: -1, value: null, count, message: `${count} balanced integer(s) in the range.` })
  return { input, result: count, frames, flags }
}

export const code = `count balanced integers (low, high):
  count = 0
  for each value x from low to high
    split x into its digits from left to right
    add the digits at odd positions and the digits at even positions
    if x has at least two digits and the two sums are equal then add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_balanced_integers(low, high):
    def ways(length, bound):
        states = {(0, bound is not None): 1}
        for pos in range(length):
            sign = 1 if pos % 2 == 0 else -1
            nxt = {}
            for (diff, tight), cnt in states.items():
                limit = bound[pos] if tight else 9
                lo = 1 if pos == 0 else 0
                for d in range(lo, limit + 1):
                    key = (diff + sign * d, tight and d == limit)
                    nxt[key] = nxt.get(key, 0) + cnt
            states = nxt
        return sum(cnt for (diff, _), cnt in states.items() if diff == 0)

    def balanced_upto(x):
        if x < 10:
            return 0
        digits = [int(c) for c in str(x)]
        total = 0
        for length in range(2, len(digits)):
            total += ways(length, None)
        total += ways(len(digits), digits)
        return total

    return balanced_upto(high) - balanced_upto(low - 1)
`
