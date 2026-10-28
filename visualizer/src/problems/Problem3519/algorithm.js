const MOD = 1000000007
const PASCAL = [[1]]
// Binomial coefficient modulo MOD, built by Pascal's rule.
const choose = (n, k) => {
  while (PASCAL.length <= n) {
    const row = PASCAL.length
    const next = [1]
    for (let j = 1; j < row; j++) next.push((PASCAL[row - 1][j - 1] + PASCAL[row - 1][j]) % MOD)
    next.push(1)
    PASCAL.push(next)
  }
  return k < 0 || k > n ? 0 : PASCAL[n][k]
}

const DECIMAL = /^(0|[1-9]\d*)$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input.l !== 'string' || typeof input.r !== 'string' || !Number.isInteger(input.b)) {
    throw new Error('Use an object such as {"l": "23", "r": "28", "b": 8}.')
  }
  const { l, r, b } = input
  if (!DECIMAL.test(l) || !DECIMAL.test(r)) throw new Error('l and r are decimal strings with no leading zeros.')
  if (l.length > 30 || r.length > 30) throw new Error('l and r have at most 30 digits for the visualization.')
  if (BigInt(l) > BigInt(r)) throw new Error('l must not be greater than r.')
  if (b < 2 || b > 10) throw new Error('The base b is an integer from 2 to 10.')
  return { l, r, b }
}

// Counts v in [0, x] whose base-b digits never decrease. Each length below the bound's length
// is a multiset count; the bound's own length is walked digit by digit.
function uptoCount(x, b, part, frames) {
  if (x < 0n) return 0
  const digits = x === 0n ? [0] : [...x.toString(b)].map(c => parseInt(c, b))
  const len = digits.length
  let total = 1
  for (let k = 1; k < len; k++) total = (total + choose(b + k - 2, k)) % MOD
  let lo = 1
  for (let i = 0; i < len; i++) {
    const rem = len - i - 1
    for (let d = lo; d < digits[i]; d++) total = (total + choose(rem + (b - d) - 1, rem)) % MOD
    if (digits[i] < lo) break
    lo = digits[i]
    if (i === len - 1) total = (total + 1) % MOD
    frames.push({ phase: 'digit', part, position: i, digit: digits[i], total, activeLine: L('for each smaller digit'), message: `${part} in base ${b}: digit ${digits[i]} at position ${i}. Running count ${total}.` })
  }
  return total
}

export function buildTrace({ l, r, b }) {
  const input = { l, r, b }
  const frames = [{ phase: 'start', part: 'start', position: -1, digit: null, total: 0, activeLine: L('count up to r'), message: `Count the base-${b} numbers up to r, then remove those below l.` }]
  const upR = uptoCount(BigInt(r), b, 'r', frames)
  const upL = uptoCount(BigInt(l) - 1n, b, 'l-1', frames)
  const result = ((upR - upL) % MOD + MOD) % MOD
  frames.push({ phase: 'done', part: 'done', position: -1, digit: null, total: result, activeLine: L('return the difference'), message: `Answer: ${result}.` })
  return { input, result, frames }
}

export const code = `count base-b numbers in [l, r] with non-decreasing digits
  count up to r and call it upper
  count up to l minus one and call it lower
  count the numbers up to a bound x as follows
    add 1 for zero and one for each shorter length using a choose count
    walk the digits of x from the left
      for each smaller digit that keeps the order, add the completions
      stop if this digit is below the one before it
    if every digit fits, add x itself
  return the difference modulo 10^9 + 7`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import comb

MOD = 10**9 + 7

def to_base(x, b):
    if x == 0:
        return [0]
    digits = []
    while x:
        digits.append(x % b)
        x //= b
    return digits[::-1]

def count_up_to(x, b):
    if x < 0:
        return 0
    digits = to_base(x, b)
    length = len(digits)
    total = 1
    for k in range(1, length):
        total += comb(b + k - 2, k)
    lo = 1
    for i in range(length):
        rem = length - i - 1
        for d in range(lo, digits[i]):
            total += comb(rem + (b - d) - 1, rem)
        if digits[i] < lo:
            break
        lo = digits[i]
        if i == length - 1:
            total += 1
    return total

def count_non_decreasing(l, r, b):
    return (count_up_to(int(r), b) - count_up_to(int(l) - 1, b)) % MOD
`
