export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with coins (an array) and k.')
  const { coins, k } = data
  if (!Array.isArray(coins) || coins.length < 1 || coins.length > 8) throw new Error('coins needs 1 to 8 denominations.')
  if (coins.some(v => !Number.isInteger(v) || v < 1 || v > 25)) throw new Error('Each coin is an integer from 1 to 25.')
  if (!Number.isInteger(k) || k < 1 || k > 60) throw new Error('k is an integer from 1 to 60.')
  return { coins, k }
}

const gcd = (a, b) => (b ? gcd(b, a % b) : a)
const lcm = (a, b) => (a / gcd(a, b)) * b

export function buildTrace({ coins, k }) {
  // Amounts that can be made with a single denomination are the multiples of one coin.
  // Inclusion-exclusion over groups of coins counts the distinct multiples up to a limit.
  const count = limit => {
    let total = 0
    for (let mask = 1; mask < 1 << coins.length; mask++) {
      let step = 1
      let size = 0
      for (let j = 0; j < coins.length; j++) {
        if ((mask >> j) & 1) {
          step = lcm(step, coins[j])
          size++
        }
      }
      total += (size % 2 === 1 ? 1 : -1) * Math.floor(limit / step)
    }
    return total
  }
  let lo = 1
  let hi = Math.min(...coins) * k
  const domain = [lo, hi]
  const frames = [{ phase: 'start', activeLine: L('set low to 1'), lo, hi, mid: null, verdict: null, count: null, message: `Coins ${coins.join(', ')}. The answer lies between ${lo} and ${hi}.` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const seen = count(mid)
    const verdict = seen >= k
    frames.push({ phase: 'probe', activeLine: L('if at least k amounts are at most mid'), lo, hi, mid, verdict, count: seen, message: `Amount ${mid}: ${seen} amounts up to it can be made, ${verdict ? 'at least' : 'fewer than'} k = ${k}.` })
    if (verdict) hi = mid
    else lo = mid + 1
  }
  frames.push({ phase: 'done', activeLine: L('return low'), lo, hi: lo, mid: null, verdict: null, count: count(lo), message: `The ${k}th smallest amount is ${lo}.` })
  return { input: { coins, k }, domain, result: lo, frames }
}

export const code = `kth smallest amount made from the multiples of one denomination
  set low to 1 and high to the smallest coin times k
  while low is less than high
    set mid to the middle value, rounded down
    if at least k amounts are at most mid then
      set high to mid
    else
      set low to mid plus 1
  return low

count of amounts up to a limit
  for each non-empty group of coins
    find the least common multiple of the group
    add the multiples of that value up to the limit when the group has an odd size
    subtract them when the group has an even size
  return the total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def kth_smallest_amount(coins, k):
    def lcm(a, b):
        x, y = a, b
        while y:
            x, y = y, x % y
        return a // x * b

    def count(limit):
        total = 0
        m = len(coins)
        for mask in range(1, 1 << m):
            step = 1
            size = 0
            for j in range(m):
                if (mask >> j) & 1:
                    step = lcm(step, coins[j])
                    size += 1
            total += (1 if size % 2 == 1 else -1) * (limit // step)
        return total

    low, high = 1, min(coins) * k
    while low < high:
        mid = (low + high) // 2
        if count(mid) >= k:
            high = mid
        else:
            low = mid + 1
    return low
`
