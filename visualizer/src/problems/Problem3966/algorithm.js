export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || ![data.l, data.r, data.k].every(Number.isInteger)) throw new Error('Use {"l": l, "r": r, "k": k} with integers.')
  const { l, r, k } = data
  if (l < 10 || r < l || r > 5000) throw new Error('Need 10 <= l <= r <= 5000 for the visualization.')
  if (k < 0 || k > 9) throw new Error('k is an integer from 0 to 9.')
  return { l, r, k }
}

// Counts good integers in [1, x] with a memoized digit walk, returning the count and the number of states visited.
function goodUpTo(x, k, frames, label) {
  if (x <= 0) return 0
  const digits = String(x).split('').map(Number)
  const memo = new Map()
  const go = (pos, prev, tight, started) => {
    if (pos === digits.length) return started ? 1 : 0
    const key = `${pos},${prev},${tight},${started}`
    if (memo.has(key)) return memo.get(key)
    const limit = tight ? digits[pos] : 9
    let total = 0
    for (let d = 0; d <= limit; d++) {
      const nowTight = tight && d === limit
      if (!started && d === 0) total += go(pos + 1, -1, nowTight, false)
      else if (!started || Math.abs(d - prev) <= k) total += go(pos + 1, d, nowTight, true)
    }
    memo.set(key, total)
    return total
  }
  const result = go(0, -1, true, false)
  frames.push({ phase: 'bound', activeLine: L('let digits be'), label, bound: x, states: memo.size, count: result, message: `Good integers from 1 to ${x}: ${result}.` })
  return result
}

export function buildTrace(input) {
  const { l, r, k } = input
  const frames = [{ phase: 'start', activeLine: L('return good up to r minus'), label: null, bound: null, states: 0, count: null, message: `Count good integers in [${l}, ${r}] with adjacent digit gaps at most ${k}.` }]
  const upR = goodUpTo(r, k, frames, 'r')
  const upL = goodUpTo(l - 1, k, frames, 'l - 1')
  const result = upR - upL
  frames.push({ phase: 'done', activeLine: L('return total'), label: null, bound: null, states: 0, count: result, message: `Good integers in [${l}, ${r}]: ${result}.` })
  return { input, result, frames }
}

export const code = `count good integers in the range [l, r]
  return good up to r minus good up to l minus 1
define good up to x
  let digits be the digits of x
  define go(pos, prev, tight, started)
    if pos is past the last digit then return 1 if started else 0
    let limit be digits[pos] if tight else 9
    let total be 0
    for each digit d from 0 to limit
      let nowTight be tight and d equals limit
      if not started and d is 0 then add go(pos + 1, none, nowTight, false) to total
      else if not started or the gap from prev is at most k then add go(pos + 1, d, nowTight, true) to total
    return total
  return go(0, none, true, false)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_good_integers_in_range(l, r, k):
    def good_up_to(x):
        if x <= 0:
            return 0
        digits = [int(c) for c in str(x)]
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
                now_tight = tight and d == limit
                if not started and d == 0:
                    total += go(pos + 1, -1, now_tight, False)
                elif not started or abs(d - prev) <= k:
                    total += go(pos + 1, d, now_tight, True)
            memo[key] = total
            return total

        return go(0, -1, True, False)

    return good_up_to(r) - good_up_to(l - 1)
`
