export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with low, high and k.')
  const { low, high, k } = input
  if (!Number.isInteger(low) || !Number.isInteger(high) || low < 1 || high > 10000 || low > high) throw new Error('Use integers with 1 <= low <= high <= 10000.')
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('k is an integer from 1 to 20.')
  return { low, high, k }
}

export function buildTrace({ low, high, k }) {
  const frames = [{ phase: 'start', activeLine: L('count beautiful'), bound: '', total: 0, message: `Count beautiful integers in [${low}, ${high}] that are divisible by ${k}.` }]
  // Counts beautiful integers from 1 to x. State: position, even-minus-odd difference, remainder mod k, tight, started.
  const upTo = (x, label) => {
    if (x <= 0) return 0
    const digits = String(x).split('').map(Number)
    const n = digits.length
    const memo = new Map()
    const go = (pos, diff, rem, tight, started) => {
      if (pos === n) return started && diff === 0 && rem === 0 ? 1 : 0
      const key = `${pos},${diff},${rem},${tight},${started}`
      if (memo.has(key)) return memo.get(key)
      const limit = tight ? digits[pos] : 9
      let total = 0
      for (let d = 0; d <= limit; d++) {
        const nextTight = tight && d === limit
        if (!started && d === 0) total += go(pos + 1, 0, 0, nextTight, false)
        else total += go(pos + 1, diff + (d % 2 === 0 ? 1 : -1), (rem * 10 + d) % k, nextTight, true)
      }
      memo.set(key, total)
      return total
    }
    const total = go(0, 0, 0, true, false)
    frames.push({ phase: 'count', activeLine: L('for each digit d'), bound: label, total, message: `Beautiful integers from 1 to ${x}: ${total}.` })
    return total
  }
  const upper = upTo(high, high)
  const lower = upTo(low - 1, low - 1)
  const result = upper - lower
  frames.push({ phase: 'done', activeLine: L('return count(high)'), bound: '', total: result, message: `${upper} minus ${lower} gives ${result}.` })
  return { input: { low, high, k }, result, frames }
}

export const code = `count beautiful integers in [low, high]: equal even and odd digit counts, and divisible by k
define count(X) as the number of beautiful integers from 1 to X
walk the digits of X with state (position, even minus odd, remainder mod k, tight, started)
for each digit d up to the current limit do
  if the number has not started and d is 0 then keep it unstarted
  otherwise add d: an even digit adds 1 to the difference, an odd digit subtracts 1, and the remainder becomes (10 * rem + d) mod k
memoize each state so repeated states are counted once
at the end count the state when started, the difference is 0 and the remainder is 0
return count(high) minus count(low - 1)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_beautiful(low, high, k):
    def upto(x):
        if x <= 0:
            return 0
        digits = [int(c) for c in str(x)]
        n = len(digits)
        memo = {}

        def go(pos, diff, rem, tight, started):
            if pos == n:
                return 1 if started and diff == 0 and rem == 0 else 0
            key = (pos, diff, rem, tight, started)
            if key in memo:
                return memo[key]
            limit = digits[pos] if tight else 9
            total = 0
            for d in range(limit + 1):
                next_tight = tight and d == limit
                if not started and d == 0:
                    total += go(pos + 1, 0, 0, next_tight, False)
                else:
                    step = 1 if d % 2 == 0 else -1
                    total += go(pos + 1, diff + step, (rem * 10 + d) % k, next_tight, True)
            memo[key] = total
            return total

        return go(0, 0, 0, True, False)

    return upto(high) - upto(low - 1)
`
