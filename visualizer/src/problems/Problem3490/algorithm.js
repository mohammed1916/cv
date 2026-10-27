export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with l and r.')
  const { l, r } = input
  if (!Number.isInteger(l) || !Number.isInteger(r) || l < 1 || r > 10000 || l > r) throw new Error('Use integers with 1 <= l <= r <= 10000.')
  return { l, r }
}

export function buildTrace({ l, r }) {
  const frames = [{ phase: 'start', activeLine: L('count beautiful numbers'), bound: '', total: 0, message: `Count beautiful numbers in [${l}, ${r}].` }]
  // Counts beautiful numbers from 1 to x. State: position, digit sum, digit product, tight, started.
  const upTo = (x, label) => {
    if (x <= 0) return 0
    const digits = String(x).split('').map(Number)
    const n = digits.length
    const memo = new Map()
    const go = (pos, sum, prod, tight, started) => {
      if (pos === n) return started && prod % sum === 0 ? 1 : 0
      const key = `${pos},${sum},${prod},${tight},${started}`
      if (memo.has(key)) return memo.get(key)
      const limit = tight ? digits[pos] : 9
      let total = 0
      for (let d = 0; d <= limit; d++) {
        const nextTight = tight && d === limit
        if (!started && d === 0) total += go(pos + 1, 0, 1, nextTight, false)
        else total += go(pos + 1, sum + d, prod * d, nextTight, true)
      }
      memo.set(key, total)
      return total
    }
    const total = go(0, 0, 1, true, false)
    frames.push({ phase: 'count', activeLine: L('for each digit d'), bound: label, total, message: `Beautiful numbers from 1 to ${x}: ${total}.` })
    return total
  }
  const upper = upTo(r, r)
  const lower = upTo(l - 1, l - 1)
  const result = upper - lower
  frames.push({ phase: 'done', activeLine: L('return count(r)'), bound: '', total: result, message: `${upper} minus ${lower} gives ${result}.` })
  return { input: { l, r }, result, frames }
}

export const code = `count beautiful numbers in [l, r], where the digit product is divisible by the digit sum
define count(X) as the number of beautiful numbers from 1 to X
walk the digits of X with state (position, digit sum, digit product, tight, started)
for each digit d up to the current limit do
  if the number has not started and d is 0 then keep it unstarted
  otherwise add d to the sum and multiply the product by d
memoize each state so repeated states are counted once
at the end count the state when started and the product mod the sum is 0
return count(r) minus count(l - 1)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_beautiful(l, r):
    def upto(x):
        if x <= 0:
            return 0
        digits = [int(c) for c in str(x)]
        n = len(digits)
        memo = {}

        def go(pos, total_sum, prod, tight, started):
            if pos == n:
                return 1 if started and prod % total_sum == 0 else 0
            key = (pos, total_sum, prod, tight, started)
            if key in memo:
                return memo[key]
            limit = digits[pos] if tight else 9
            total = 0
            for d in range(limit + 1):
                next_tight = tight and d == limit
                if not started and d == 0:
                    total += go(pos + 1, 0, 1, next_tight, False)
                else:
                    total += go(pos + 1, total_sum + d, prod * d, next_tight, True)
            memo[key] = total
            return total

        return go(0, 0, 1, True, False)

    return upto(r) - upto(l - 1)
`
