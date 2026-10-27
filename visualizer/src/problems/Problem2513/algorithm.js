export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with divisor1, divisor2, uniqueCnt1 and uniqueCnt2.')
  const { divisor1, divisor2, uniqueCnt1, uniqueCnt2 } = data
  if (![divisor1, divisor2].every(v => Number.isInteger(v) && v >= 2 && v <= 10)) throw new Error('Each divisor is an integer from 2 to 10.')
  if (![uniqueCnt1, uniqueCnt2].every(v => Number.isInteger(v) && v >= 1 && v <= 8)) throw new Error('Each uniqueCnt is an integer from 1 to 8.')
  return { divisor1, divisor2, uniqueCnt1, uniqueCnt2 }
}

export function buildTrace({ divisor1, divisor2, uniqueCnt1, uniqueCnt2 }) {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a)
  const lcm = (divisor1 / gcd(divisor1, divisor2)) * divisor2
  const total = uniqueCnt1 + uniqueCnt2
  // Numbers 1..x that each set may use: not divisible by its divisor; the pair must share numbers from the rest.
  const counts = x => ({
    free1: x - Math.floor(x / divisor1),
    free2: x - Math.floor(x / divisor2),
    freeBoth: x - Math.floor(x / lcm),
  })
  const fits = x => {
    const c = counts(x)
    return c.free1 >= uniqueCnt1 && c.free2 >= uniqueCnt2 && c.freeBoth >= total
  }
  let lo = 1
  let hi = 4 * total + 4
  const domain = [lo, hi]
  const frames = [{ phase: 'start', activeLine: L('set low to 1'), lo, hi, mid: null, verdict: null, counts: counts(hi), message: `The largest value lies between ${lo} and ${hi}.` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const verdict = fits(mid)
    frames.push({ phase: 'probe', activeLine: L('if each set has enough numbers'), lo, hi, mid, verdict, counts: counts(mid), message: `Limit ${mid}: set one can use ${counts(mid).free1}, set two ${counts(mid).free2}, both together ${counts(mid).freeBoth}. ${verdict ? 'Enough.' : 'Not enough.'}` })
    if (verdict) hi = mid
    else lo = mid + 1
  }
  frames.push({ phase: 'done', activeLine: L('return low'), lo, hi: lo, mid: null, verdict: null, counts: counts(lo), message: `Smallest possible maximum: ${lo}.` })
  return { input: { divisor1, divisor2, uniqueCnt1, uniqueCnt2 }, domain, result: lo, frames }
}

export const code = `minimum possible largest value for two disjoint sets of distinct positive integers
  set low to 1 and high to four times the total count plus four
  while low is less than high
    set mid to the middle value, rounded down
    if each set has enough numbers it may use, and together they have enough then
      set high to mid
    else
      set low to mid plus 1
  return low

counts for a limit x
  count the numbers up to x that the first divisor does not divide
  count the numbers up to x that the second divisor does not divide
  count the numbers up to x that neither divisor divides`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimize_set_maximum(divisor1, divisor2, uniqueCnt1, uniqueCnt2):
    def gcd(a, b):
        while b:
            a, b = b, a % b
        return a

    lcm = divisor1 // gcd(divisor1, divisor2) * divisor2
    total = uniqueCnt1 + uniqueCnt2

    def fits(x):
        free1 = x - x // divisor1
        free2 = x - x // divisor2
        both = x - x // lcm
        return free1 >= uniqueCnt1 and free2 >= uniqueCnt2 and both >= total

    low, high = 1, 4 * total + 4
    while low < high:
        mid = (low + high) // 2
        if fits(mid):
            high = mid
        else:
            low = mid + 1
    return low
`
