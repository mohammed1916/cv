const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with low and high.')
  const { low, high } = input
  if (typeof low !== 'string' || typeof high !== 'string' || !/^[1-9][0-9]{0,3}$/.test(low) || !/^[1-9][0-9]{0,3}$/.test(high)) throw new Error('low and high are digit strings of 1 to 4 digits with no leading zero.')
  if (Number(low) > Number(high)) throw new Error('low must not be greater than high.')
  return { low, high }
}

const isStepping = s => [...s].every((c, i) => i === 0 || Math.abs(Number(c) - Number(s[i - 1])) === 1)

export function buildTrace({ low, high }) {
  const frames = [{ phase: 'start', activeLine: L('count stepping numbers'), bound: '', total: 0, message: 'Start with the two bounds.' }]
  // Counts stepping numbers from 1 to x. The state is (position, previous digit, still tight, started).
  const upTo = (x, label) => {
    const digits = [...x].map(Number)
    const n = digits.length
    const memo = new Map()
    const go = (pos, prev, tight, started) => {
      if (pos === n) return started ? 1 : 0
      const key = `${pos},${prev},${tight},${started}`
      if (memo.has(key)) return memo.get(key)
      const limit = tight ? digits[pos] : 9
      let total = 0
      for (let d = 0; d <= limit; d++) {
        const nextTight = tight && d === limit
        if (!started) total += d === 0 ? go(pos + 1, -1, nextTight, false) : go(pos + 1, d, nextTight, true)
        else if (Math.abs(d - prev) === 1) total += go(pos + 1, d, nextTight, true)
      }
      memo.set(key, total)
      return total
    }
    const total = go(0, -1, true, false)
    frames.push({ phase: 'count', activeLine: L('for each digit d'), bound: label, total, message: `Stepping numbers from 1 to ${x}: ${total}.` })
    return total
  }
  const upper = upTo(high, high)
  const lower = upTo(low, low)
  const inclusive = isStepping(low) ? 1 : 0
  const result = (((upper - lower + inclusive) % MOD) + MOD) % MOD
  frames.push({ phase: 'done', activeLine: L('return the difference'), bound: '', total: result, message: `${upper} minus ${lower} plus ${inclusive} gives ${result}.` })
  return { input: { low, high }, result, frames }
}

export const code = `count stepping numbers in [low, high], where adjacent digits differ by exactly 1
define count(X) as the number of stepping numbers from 1 to X
walk the digits of X with state (position, previous digit, still tight, started)
for each digit d up to the current limit do
  if the number has not started and d is 0 then keep it unstarted
  otherwise keep d only when it differs from the previous digit by 1
memoize each state so repeated states are counted once
add low itself back when low is a stepping number
return the difference count(high) minus count(low), plus low when it is stepping`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_stepping(low, high):
    MOD = 10 ** 9 + 7

    def upto(x):
        digits = [int(c) for c in x]
        n = len(digits)
        memo = {}

        def go(pos, prev, tight, started):
            if pos == n:
                return 1 if started else 0
            key = (pos, prev, tight, started)
            if key in memo:
                return memo[key]
            limit = digits[pos] if tight else 9
            total = 0
            for d in range(limit + 1):
                next_tight = tight and d == limit
                if not started:
                    total += go(pos + 1, -1, next_tight, False) if d == 0 else go(pos + 1, d, next_tight, True)
                elif abs(d - prev) == 1:
                    total += go(pos + 1, d, next_tight, True)
            memo[key] = total
            return total

        return go(0, -1, True, False)

    low_ok = all(abs(int(a) - int(b)) == 1 for a, b in zip(low, low[1:]))
    return (upto(high) - upto(low) + (1 if low_ok else 0)) % MOD
`
