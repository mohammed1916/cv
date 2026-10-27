export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n.')
  const { n } = data
  if (!Number.isInteger(n) || n < 2 || n > 1000) throw new Error('n must be an integer from 2 to 1000.')
  return { n }
}

export const code = `smallest value that n reaches by replacing it with its prime factor sum
  let current be n
  set chain to the list containing n
  let s be the sum of the prime factors of current, counted with repeats
  if s equals current then the value is settled
  set current to s and add it to the chain
  repeat from the sum step
  return current`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const factorSum = x => {
  let total = 0
  let v = x
  for (let d = 2; d * d <= v; d++) {
    while (v % d === 0) { total += d; v /= d }
  }
  if (v > 1) total += v
  return total
}

export function buildTrace({ n }) {
  const chain = [n]
  const frames = [{ phase: 'start', activeLine: L('let current be n'), index: 0, chain: [...chain], message: `Start with ${n}.` }]
  let current = n
  for (;;) {
    const s = factorSum(current)
    if (s === current) {
      frames.push({ phase: 'fixed', activeLine: L('if s equals current'), index: chain.length - 1, chain: [...chain], message: `${current} is the sum of its own prime factors, so it no longer changes.` })
      break
    }
    frames.push({ phase: 'replace', activeLine: L('let s be the sum'), index: chain.length - 1, chain: [...chain], message: `Replace ${current} with ${s}.` })
    current = s
    chain.push(current)
    frames.push({ phase: 'replace', activeLine: L('set current to s'), index: chain.length - 1, chain: [...chain], message: `Now the value is ${current}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return current'), index: chain.length - 1, chain: [...chain], message: `Smallest value: ${current}.` })
  return { input: { n }, chain, result: current, frames }
}

export const python = `def smallest_fixed_value(n):
    def prime_factor_sum(x):
        total = 0
        d = 2
        while d * d <= x:
            while x % d == 0:
                total += d
                x //= d
            d += 1
        if x > 1:
            total += x
        return total

    current = n
    while True:
        s = prime_factor_sum(current)
        if s == current:
            return current
        current = s
`
