export function parseInput(text) {
  const input = JSON.parse(text)
  for (const key of ['n', 'a', 'b', 'c']) {
    if (!Number.isInteger(input?.[key])) throw new Error(`${key} must be an integer.`)
  }
  if (input.n < 1 || input.n > 20) throw new Error('n is an integer from 1 to 20.')
  for (const key of ['a', 'b', 'c']) {
    if (input[key] < 1 || input[key] > 20) throw new Error(`${key} is an integer from 1 to 20.`)
  }
  return { n: input.n, a: input.a, b: input.b, c: input.c }
}

const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y))
const lcm = (x, y) => (x / gcd(x, y)) * y

export function buildTrace({ n, a, b, c }) {
  const ab = lcm(a, b), ac = lcm(a, c), bc = lcm(b, c), abc = lcm(ab, c)
  // Counts the numbers from 1 to x divisible by a, b or c.
  const foundUpTo = x => Math.floor(x / a) + Math.floor(x / b) + Math.floor(x / c) - Math.floor(x / ab) - Math.floor(x / ac) - Math.floor(x / bc) + Math.floor(x / abc)
  let low = 1, high = n * Math.min(a, b, c)
  const frames = [{ phase: 'start', activeLine: L('set low to one'), low, high, mid: null, found: null, message: `The answer is at most ${n} times the smallest divisor, ${high}.` }]
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const found = foundUpTo(mid)
    if (found >= n) high = mid
    else low = mid + 1
    frames.push({ phase: 'probe', activeLine: L('if found is at least'), low, high, mid, found, message: `${found} numbers up to ${mid} are divisible by a, b or c; need ${n}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return low'), low, high, mid: null, found: null, message: `The ${n}th such number is ${low}.` })
  return { input: { n, a, b, c }, result: low, frames }
}

export const code = `nth divisible number (n, a, b, c)
  set low to one and high to n times the smallest of a, b, c
  while low is below high
    set mid to the middle of low and high rounded down
    set found to how many numbers up to mid are divisible by a, b or c
    if found is at least n then
      set high to mid
    otherwise
      set low to mid plus one
  return low`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import gcd

def nth_divisible(n, a, b, c):
    def lcm(x, y):
        return x * y // gcd(x, y)
    ab = lcm(a, b)
    ac = lcm(a, c)
    bc = lcm(b, c)
    abc = lcm(ab, c)
    def found_up_to(x):
        return x // a + x // b + x // c - x // ab - x // ac - x // bc + x // abc
    low = 1
    high = n * min(a, b, c)
    while low < high:
        mid = (low + high) // 2
        if found_up_to(mid) >= n:
            high = mid
        else:
            low = mid + 1
    return low
`
