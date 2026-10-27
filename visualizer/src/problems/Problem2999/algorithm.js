export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.start !== 'string' || typeof obj.finish !== 'string' || typeof obj.s !== 'string' || !Number.isInteger(obj.limit)) {
    throw new Error('Use {"start": "digits", "finish": "digits", "limit": integer, "s": "digits"}.')
  }
  if (!/^[1-9][0-9]*$/.test(obj.start) || !/^[1-9][0-9]*$/.test(obj.finish)) throw new Error('start and finish are positive integers without leading zeros.')
  if (Number(obj.finish) > 100000) throw new Error('finish is at most 100000 in this visualization.')
  if (Number(obj.start) > Number(obj.finish)) throw new Error('start must not exceed finish.')
  if (!/^[1-9][0-9]*$/.test(obj.s) || obj.s.length > obj.finish.length) throw new Error('s is a digit string with no leading zero, no longer than finish.')
  if (obj.limit < 1 || obj.limit > 9) throw new Error('limit is an integer from 1 to 9.')
  return { start: obj.start, finish: obj.finish, limit: obj.limit, s: obj.s }
}

export function buildTrace(input) {
  const { start, finish, limit, s } = input
  const sValue = Number(s)
  const base = 10 ** s.length
  const countPrefixes = bound => {
    if (bound < 0) return 0
    const digits = String(bound)
    let total = 0
    for (let i = 0; i < digits.length; i++) {
      const d = Number(digits[i])
      const rest = digits.length - i - 1
      total += Math.min(d, limit + 1) * (limit + 1) ** rest
      if (d > limit) return total
    }
    return total + 1
  }
  const countUpTo = x => (x < sValue ? 0 : countPrefixes(Math.floor((x - sValue) / base)))
  const frames = [{ phase: 'start', activeLine: L('if some digit of s'), bound: null, count: null, message: `Every digit of s must be at most ${limit}, and then each valid number is a prefix followed by s.` }]
  if ([...s].some(ch => Number(ch) > limit)) {
    frames.push({ phase: 'done', activeLine: L('return 0'), bound: null, count: null, message: 's uses a digit above the limit, so no number can end with it.' })
    return { input, result: 0, frames }
  }
  const high = countUpTo(Number(finish))
  frames.push({ phase: 'upper', activeLine: L('set high to'), bound: Number(finish), count: high, message: `Valid numbers up to ${finish}: ${high}.` })
  const low = countUpTo(Number(start) - 1)
  frames.push({ phase: 'lower', activeLine: L('set low to'), bound: Number(start) - 1, count: low, message: `Valid numbers up to ${Number(start) - 1}: ${low}.` })
  const result = high - low
  frames.push({ phase: 'done', activeLine: L('return high - low'), bound: null, count: result, message: `Powerful integers in [${start}, ${finish}]: ${result}.` })
  return { input, result, frames }
}

export const code = `count powerful integers from start to finish:
  if some digit of s is above limit then
    return 0
  set high to the count of valid numbers up to finish
  set low to the count of valid numbers up to start - 1
  return high - low
where a valid number up to x is counted as:
  if x is below the value of s then count 0
  set p to (x - value of s) divided by 10 to the power of len(s), rounded down
  count the p from 0 to p whose digits are all at most limit`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_powerful_integers(start, finish, limit, s):
    if any(int(ch) > limit for ch in s):
        return 0
    s_value = int(s)
    base = 10 ** len(s)

    def count_prefixes(bound):
        if bound < 0:
            return 0
        digits = str(bound)
        total = 0
        for i, ch in enumerate(digits):
            d = int(ch)
            rest = len(digits) - i - 1
            total += min(d, limit + 1) * (limit + 1) ** rest
            if d > limit:
                return total
        return total + 1

    def count_up_to(x):
        if x < s_value:
            return 0
        return count_prefixes((x - s_value) // base)

    return count_up_to(int(finish)) - count_up_to(int(start) - 1)
`
