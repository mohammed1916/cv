export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n.')
  const { n } = data
  if (!Number.isInteger(n) || n < 1 || n > 2000) throw new Error('n is an integer from 1 to 2000.')
  return { n }
}

export function buildTrace(input) {
  const { n } = input
  const memo = new Map()
  const entries = []
  const snapshot = () => entries.map(e => ({ ...e }))
  const frames = [{ phase: 'start', activeLine: L('fewest days to eat'), remaining: n, memo: [], message: `Find the fewest days to finish ${n} oranges.` }]

  const days = remaining => {
    if (remaining <= 1) {
      frames.push({ phase: 'base', activeLine: L('if remaining is at most 1'), remaining, memo: snapshot(), message: `${remaining} orange${remaining === 1 ? '' : 's'} left takes ${remaining} day${remaining === 1 ? '' : 's'}.` })
      return remaining
    }
    if (memo.has(remaining)) {
      const value = memo.get(remaining)
      frames.push({ phase: 'reuse', activeLine: L('if memo already holds'), remaining, memo: snapshot(), message: `${remaining} oranges already need ${value} days.` })
      return value
    }
    frames.push({ phase: 'visit', activeLine: L('set half option'), remaining, memo: snapshot(), message: `Compare eating half or two thirds of ${remaining}. An odd count first loses one orange to a day of eating one.` })
    const half = remaining % 2 + days(Math.floor(remaining / 2))
    const third = remaining % 3 + days(Math.floor(remaining / 3))
    const best = 1 + Math.min(half, third)
    memo.set(remaining, best)
    entries.push({ remaining, days: best })
    frames.push({ phase: 'store', activeLine: L('store one plus'), remaining, memo: snapshot(), message: `${remaining} oranges need ${best} days.` })
    return best
  }

  const result = days(n)
  frames.push({ phase: 'done', activeLine: L('return days for n'), remaining: 0, memo: snapshot(), message: `Fewest days for ${n} oranges: ${result}.` })
  return { input, result, frames }
}

export const code = `fewest days to eat n oranges
  return days for n

days(remaining)
  if remaining is at most 1 then return remaining
  if memo already holds remaining then return it
  set half option to remaining mod 2 plus days for remaining divided by 2, rounded down
  set third option to remaining mod 3 plus days for remaining divided by 3, rounded down
  store one plus the smaller of half option and third option, then return it`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_days(n):
    memo = {}

    def days(remaining):
        if remaining <= 1:
            return remaining
        if remaining in memo:
            return memo[remaining]
        half = remaining % 2 + days(remaining // 2)
        third = remaining % 3 + days(remaining // 3)
        memo[remaining] = 1 + min(half, third)
        return memo[remaining]

    return days(n)
`
