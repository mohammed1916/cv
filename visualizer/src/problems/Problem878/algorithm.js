const MOD = 1000000007

const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y))

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length !== 3 || arr.some(v => !Number.isInteger(v))) throw new Error('Enter a JSON array [n, a, b].')
  const [n, a, b] = arr
  if (n < 1 || n > 1000000000 || a < 2 || a > 40000 || b < 2 || b > 40000) throw new Error('Need 1 ≤ n ≤ 1,000,000,000 and 2 ≤ a, b ≤ 40,000.')
  return { n, a, b }
}

export function buildTrace({ n, a, b }) {
  const l = (a / gcd(a, b)) * b
  let lo = 1
  let hi = n * Math.min(a, b)
  const frames = [{ phase: 'start', lo, hi, mid: null, count: null, activeLine: L('let l be the least common'), message: `lcm(${a}, ${b}) = ${l}. The answer lies in [1, n * min(a, b)] = [${lo}, ${hi}].` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const count = Math.floor(mid / a) + Math.floor(mid / b) - Math.floor(mid / l)
    frames.push({
      phase: 'probe', lo, hi, mid, count, activeLine: L('count the magical numbers'),
      message: `mid = ${mid}: ${Math.floor(mid / a)} multiples of ${a} + ${Math.floor(mid / b)} multiples of ${b} - ${Math.floor(mid / l)} of lcm ${l} = ${count} magical numbers up to mid.`,
    })
    if (count >= n) {
      hi = mid
      frames.push({ phase: 'shrink', lo, hi, mid, count, activeLine: L('set hi to mid'), message: `${count} ≥ ${n}: the n-th magical number is at most ${mid}, so hi = ${mid}.` })
    } else {
      lo = mid + 1
      frames.push({ phase: 'shrink', lo, hi, mid, count, activeLine: L('set lo to mid + 1'), message: `${count} < ${n}: the answer is above ${mid}, so lo = ${lo}.` })
    }
  }
  const result = lo % MOD
  frames.push({ phase: 'done', lo, hi, mid: null, count: null, activeLine: L('return lo, taken mod'), message: `lo = hi = ${lo}; return ${lo} mod 1,000,000,007 = ${result}.` })
  return { input: { n, a, b }, lcm: l, answer: lo, result, frames }
}

export const code = `let l be the least common multiple of a and b
set lo to 1 and hi to n times the smaller of a and b
while lo is less than hi, do
  let mid be the midpoint of lo and hi, rounded down
  count the magical numbers up to mid by inclusion-exclusion: multiples of a, plus multiples of b, minus multiples of l
  if that count is at least n, then
    set hi to mid
  otherwise
    set lo to mid + 1
return lo, taken mod 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import lcm


def nth_magical_number(n, a, b):
    MOD = 10**9 + 7
    l = lcm(a, b)
    lo, hi = 1, n * min(a, b)
    while lo < hi:
        mid = (lo + hi) // 2
        if mid // a + mid // b - mid // l >= n:
            hi = mid
        else:
            lo = mid + 1
    return lo % MOD
`
