const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with num1, num2, min_sum and max_sum.')
  const { num1, num2, min_sum, max_sum } = input
  if (typeof num1 !== 'string' || typeof num2 !== 'string' || !/^[0-9]{1,4}$/.test(num1) || !/^[0-9]{1,4}$/.test(num2)) throw new Error('num1 and num2 are digit strings of 1 to 4 characters.')
  if (num1[0] === '0' || num2[0] === '0') throw new Error('num1 and num2 have no leading zeros.')
  if (Number(num1) > Number(num2)) throw new Error('num1 must not be greater than num2.')
  if (!Number.isInteger(min_sum) || !Number.isInteger(max_sum) || min_sum < 1 || max_sum > 36 || min_sum > max_sum) throw new Error('Use integer digit sums with 1 <= min_sum <= max_sum <= 36.')
  return { num1, num2, min_sum, max_sum }
}

export function buildTrace({ num1, num2, min_sum, max_sum }) {
  const width = num2.length
  // ways[k][s]: how many strings of k digits (leading zeros allowed) have digit sum s.
  const ways = [Array.from({ length: 9 * width + 1 }, (_, s) => (s === 0 ? 1 : 0))]
  for (let k = 1; k <= width; k++) {
    const row = new Array(9 * width + 1).fill(0)
    for (let s = 0; s <= 9 * k; s++) {
      for (let d = 0; d <= 9; d++) if (s - d >= 0) row[s] += ways[k - 1][s - d]
    }
    ways.push(row)
  }
  const frames = [{ phase: 'start', activeLine: L('ways[k][s]'), bound: '', total: 0, message: `Precompute the digit-sum table for strings of up to ${width} digits.` }]
  const count = (x, label) => {
    const digits = x.padStart(width, '0').split('').map(Number)
    let total = 0
    let prefix = 0
    digits.forEach((d, i) => {
      const rest = width - i - 1
      for (let e = 0; e < d; e++) {
        const base = prefix + e
        for (let t = Math.max(0, min_sum - base); t <= max_sum - base; t++) {
          if (t <= 9 * rest) total += ways[rest][t]
        }
      }
      prefix += d
    })
    if (prefix >= min_sum && prefix <= max_sum) total += 1
    frames.push({ phase: 'count', activeLine: L('define count'), bound: label, total, message: `Integers from 0 to ${x} with digit sum in range: ${total}.` })
    return total
  }
  const upper = count(num2, num2)
  const lower = count(num1, num1)
  const fits = [...num1].reduce((a, c) => a + Number(c), 0)
  const inRange = fits >= min_sum && fits <= max_sum ? 1 : 0
  const result = (((upper - lower + inRange) % MOD) + MOD) % MOD
  frames.push({ phase: 'done', activeLine: L('return count(num2)'), bound: '', total: result, message: `${upper} minus ${lower} plus ${inRange} gives ${result}.` })
  return { input: { num1, num2, min_sum, max_sum }, result, frames }
}

export const code = `count integers in [num1, num2] whose digit sum is between min_sum and max_sum
ways[k][s] is the number of k-digit strings whose digits sum to s
define count(X) as the number of integers from 0 to X with a digit sum in range
for each position i of X, with a smaller digit e at i, add the strings that fit after it
include X itself when its digit sum is in range
return count(num2) minus count(num1) plus 1 when num1 is in range`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_integers(num1, num2, min_sum, max_sum):
    MOD = 10 ** 9 + 7
    width = len(num2)
    ways = [[0] * (9 * width + 1) for _ in range(width + 1)]
    ways[0][0] = 1
    for k in range(1, width + 1):
        for s in range(9 * k + 1):
            ways[k][s] = sum(ways[k - 1][s - d] for d in range(10) if 0 <= s - d <= 9 * (k - 1))

    def count(x):
        digits = [int(c) for c in x.zfill(width)]
        total = 0
        prefix = 0
        for i, d in enumerate(digits):
            rest = width - i - 1
            for e in range(d):
                base = prefix + e
                for t in range(max(0, min_sum - base), max_sum - base + 1):
                    if t <= 9 * rest:
                        total += ways[rest][t]
            prefix += d
        if min_sum <= prefix <= max_sum:
            total += 1
        return total

    fits = min_sum <= sum(int(c) for c in num1) <= max_sum
    return (count(num2) - count(num1) + (1 if fits else 0)) % MOD
`
