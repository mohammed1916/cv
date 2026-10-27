export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with k and x.')
  const { k, x } = data
  if (!Number.isInteger(k) || k < 1 || k > 200) throw new Error('k must be an integer from 1 to 200.')
  if (!Number.isInteger(x) || x < 1 || x > 8) throw new Error('x must be an integer from 1 to 8.')
  return { k, x }
}

// Numbers in 1..n whose bit b is set: each full period of 2^(b+1) contributes 2^b.
function countWithBit(n, b) {
  const period = 2 ** (b + 1)
  const half = 2 ** b
  return Math.floor((n + 1) / period) * half + Math.max(0, ((n + 1) % period) - half)
}

// Positions i (1-indexed) with i % x === 0 correspond to bit i - 1.
function totalPrice(n, x) {
  let total = 0
  for (let b = x - 1; 2 ** b <= n; b += x) total += countWithBit(n, b)
  return total
}

export function buildTrace({ k, x }) {
  const frames = []
  let low = 0
  let high = 1
  frames.push({ phase: 'start', activeLine: L('set low to 0 and high to 1'), low, high, mid: null, price: null, message: 'Price is increasing, so search for the largest affordable number.' })
  while (totalPrice(high, x) <= k) {
    high *= 2
    frames.push({ phase: 'grow', activeLine: L('double high'), low, high, mid: null, price: totalPrice(high, x), message: `Price of ${high} is still within ${k}; double the upper bound.` })
  }
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2)
    const price = totalPrice(mid, x)
    if (price <= k) {
      low = mid
      frames.push({ phase: 'keep', activeLine: L('set low to mid'), low, high, mid, price, message: `Price of ${mid} is ${price}, within ${k}; search above it.` })
    } else {
      high = mid
      frames.push({ phase: 'drop', activeLine: L('set high to mid'), low, high, mid, price, message: `Price of ${mid} is ${price}, over ${k}; search below it.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return low'), low, high, mid: null, price: totalPrice(low, x), message: `Largest number: ${low}.` })
  return { input: { k, x }, result: low, frames }
}

export const code = `largest number whose total price is at most k
  set low to 0 and high to 1
  while the total price of high is at most k do
    double high
  while high minus low is greater than 1 do
    set mid to the middle of low and high
    if the total price of mid is at most k then
      set low to mid
    otherwise
      set high to mid
  return low`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def find_maximum_number(k, x):
    def count_bit(n, b):
        period = 1 << (b + 1)
        half = 1 << b
        return (n + 1) // period * half + max(0, (n + 1) % period - half)

    def total_price(n):
        total = 0
        b = x - 1
        while (1 << b) <= n:
            total += count_bit(n, b)
            b += x
        return total

    low, high = 0, 1
    while total_price(high) <= k:
        high *= 2
    while high - low > 1:
        mid = (low + high) // 2
        if total_price(mid) <= k:
            low = mid
        else:
            high = mid
    return low
`
