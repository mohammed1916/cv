// Exponents of 2, 3, 5 and 7 contributed by each digit 1 to 9.
const EXP = { 1: [0, 0, 0, 0], 2: [1, 0, 0, 0], 3: [0, 1, 0, 0], 4: [2, 0, 0, 0], 5: [0, 0, 1, 0], 6: [1, 1, 0, 0], 7: [0, 0, 0, 1], 8: [3, 0, 0, 0], 9: [0, 2, 0, 0] }
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const LIMIT = 1000000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with num and t.')
  const { num, t } = input
  if (typeof num !== 'string' || !/^[1-9][0-9]{0,5}$/.test(num)) throw new Error('num is a positive integer string of at most 6 digits without leading zeros.')
  if (!Number.isInteger(t) || t < 1 || t > LIMIT) throw new Error(`t is an integer from 1 to ${LIMIT} for the visualization.`)
  return { num, t }
}

// Split t into the exponents of 2, 3, 5 and 7. Any other prime factor makes the answer impossible.
export function factor(t) {
  const need = [0, 0, 0, 0]
  const primes = [2, 3, 5, 7]
  let rest = t
  primes.forEach((p, i) => { while (rest % p === 0) { rest /= p; need[i] += 1 } })
  return rest === 1 ? need : null
}

const memo = new Map()
// Fewest non-1 digits whose product covers the exponents in need.
export function minDigits(need) {
  if (need.every(x => x <= 0)) return 0
  const key = need.join(',')
  if (memo.has(key)) return memo.get(key)
  let best = Infinity
  for (const d of DIGITS.slice(1)) {
    const next = minus(need, d)
    if (next.join(',') === key) continue
    best = Math.min(best, 1 + minDigits(next))
  }
  memo.set(key, best)
  return best
}

const minus = (need, digit) => need.map((x, i) => Math.max(0, x - EXP[digit][i]))
const covered = need => need.every(x => x <= 0)

// Smallest digit string of length r whose exponents cover need, given minDigits(need) <= r.
function fill(need, r) {
  let out = ''
  let cur = need
  for (let i = 0; i < r; i++) {
    const left = r - i - 1
    for (const d of DIGITS) {
      const next = minus(cur, d)
      if (minDigits(next) <= left) { out += d; cur = next; break }
    }
  }
  return out
}

export function buildTrace({ num, t }) {
  const frames = []
  const L = num.length
  const need0 = factor(t)
  const frame = (phase, line, message, extra = {}) => frames.push({ phase, activeLine: line, pythonLine: 1, message, digits: num, keep: -1, raise: -1, need: need0 || [0, 0, 0, 0], ...extra })
  if (!need0) {
    frame('factor', 1, `t = ${t} has a prime factor other than 2, 3, 5 or 7, so no digit product can be divisible by it.`)
    frame('done', 1, 'Result: -1.', { result: '-1' })
    return { input: { num, t }, result: '-1', frames }
  }
  frame('factor', 1, `t = ${t} needs 2^${need0[0]} 3^${need0[1]} 5^${need0[2]} 7^${need0[3]} from the digit product.`)

  let maxPrefix = num.indexOf('0')
  if (maxPrefix < 0) maxPrefix = L
  const prefixExp = [[0, 0, 0, 0]]
  for (let i = 0; i < maxPrefix; i++) {
    const d = Number(num[i])
    const e = prefixExp[i]
    prefixExp.push(e.map((x, j) => x + EXP[d][j]))
  }

  let result = null
  if (maxPrefix === L && covered(need0.map((x, j) => x - prefixExp[L][j]))) {
    result = num
    frame('done', 1, `${num} is already zero-free and its digit product is divisible by ${t}.`, { keep: L, raise: -1 })
  }
  for (let i = Math.min(maxPrefix, L - 1); i >= 0 && result === null; i--) {
    frame('prefix', 1, `Keep the first ${i} digits of ${num} and try a larger digit at position ${i}.`, { keep: i, raise: -1 })
    for (let d = Number(num[i]) + 1; d <= 9; d++) {
      const need = need0.map((x, j) => Math.max(0, x - prefixExp[i][j] - EXP[d][j]))
      const rest = L - i - 1
      if (minDigits(need) <= rest) {
        result = num.slice(0, i) + d + fill(need, rest)
        frame('raise', 1, `Digit ${d} at position ${i} is larger than ${num[i]} and the remaining ${rest} positions can cover the rest.`, { keep: i, raise: i, digits: result, need })
        frame('fill', 1, `Fill the remaining ${rest} positions with the smallest digits that finish the product.`, { keep: i + 1, raise: i, digits: result, need })
        break
      }
      frame('raise', 1, `Digit ${d} at position ${i} leaves too few positions to finish the product.`, { keep: i, raise: i, need: need0 })
    }
  }
  if (result === null) {
    const m = Math.max(L + 1, minDigits(need0))
    result = fill(need0, m)
    frame('longer', 1, `No number with ${L} digits works, so use the smallest ${m}-digit zero-free number.`, { keep: -1, raise: -1, digits: result, need: need0 })
  }
  frame('done', 1, `Result: ${result}.`, { digits: result, keep: result.length, raise: -1 })
  return { input: { num, t }, result, frames }
}

export const code = `factor t into 2, 3, 5 and 7 powers, or stop with -1
if num has no zero and its product covers t, the answer is num
for each prefix length i from longest to shortest
  for each digit d above num at position i
    if the remaining positions can finish the product, fill them and return
if no same-length answer exists, return the smallest longer one`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def smallest_divisible(num, t):
    need = factor_2357(t)  # exponents of 2, 3, 5, 7
    if need is None:
        return "-1"
    if covers(num, need):
        return num
    for i in reversed(range(prefix_length(num))):
        for d in range(int(num[i]) + 1, 10):
            rest = need - exponents(num[:i]) - exponents(d)
            if fewest_digits(rest) <= len(num) - i - 1:
                return num[:i] + str(d) + smallest_fill(rest, len(num) - i - 1)
    return smallest_fill(need, max(len(num) + 1, fewest_digits(need)))`
