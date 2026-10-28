const MOD = 1000000007n

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object') throw new Error('Use a JSON object with integers l, r and k.')
  const { l, r, k } = obj
  if (![l, r, k].every(Number.isInteger)) throw new Error('l, r and k must be integers.')
  if (l < 0 || r > 9 || l > r) throw new Error('Use digits with 0 <= l <= r <= 9.')
  if (k < 1 || k > 60) throw new Error('k must be from 1 to 60 for this visualization.')
  return { l, r, k }
}

function powMod(base, exp) {
  let result = 1n
  let b = BigInt(base) % MOD
  let e = BigInt(exp)
  while (e > 0n) {
    if (e & 1n) result = (result * b) % MOD
    b = (b * b) % MOD
    e >>= 1n
  }
  return result
}

export function buildTrace({ l, r, k }) {
  const m = r - l + 1
  let digitSum = 0
  for (let d = l; d <= r; d++) digitSum += d
  const ways = powMod(m, k - 1)
  // 1 + 10 + ... + 10^(k-1) = (10^k - 1) / 9, using the inverse of 9 modulo a prime.
  const place = ((powMod(10, k) - 1n + MOD) % MOD) * powMod(9, MOD - 2n) % MOD
  const result = Number(BigInt(digitSum) * ways % MOD * place % MOD)
  const frames = [
    { phase: 'digits', activeLine: L('set digit count'), m, digitSum, ways: null, place: null, result: null, message: `The digits 0-9 allowed are ${l} to ${r}: ${m} choices per position.` },
    { phase: 'digits', activeLine: L('set digit sum'), m, digitSum, ways: null, place: null, result: null, message: `The digits add up to ${digitSum}.` },
    { phase: 'ways', activeLine: L('set ways'), m, digitSum, ways: Number(ways), place: null, result: null, message: `Each position keeps ${m}^${k - 1} = ${Number(ways)} other combinations.` },
    { phase: 'place', activeLine: L('set place value total'), m, digitSum, ways: Number(ways), place: Number(place), result: null, message: `Place values 1 + 10 + ... + 10^${k - 1} contribute ${Number(place)} modulo the prime.` },
    { phase: 'done', activeLine: L('return S times'), m, digitSum, ways: Number(ways), place: Number(place), result, message: `Sum modulo 1000000007: ${result}.` },
  ]
  return { input: { l, r, k }, result, frames }
}

export const code = `sum of k-digit numbers in a range (l, r, k):
  set digit count m to r minus l plus 1
  set digit sum S to the sum of the digits from l to r
  set ways to m to the power k minus 1
  set place value total to 1 + 10 + ... + 10 to the power k minus 1
  return S times ways times place value total, modulo 1000000007

every position takes each digit equally often, so each place value sees the digit sum`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_k_digit_numbers(l, r, k):
    MOD = 10**9 + 7
    m = r - l + 1
    digit_sum = sum(range(l, r + 1))
    ways = pow(m, k - 1, MOD)
    place = (pow(10, k, MOD) - 1) * pow(9, MOD - 2, MOD) % MOD
    return digit_sum * ways % MOD * place % MOD
`
