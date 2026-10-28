export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n) || !Number.isInteger(input.k)) throw new Error('Use a JSON object with integers n and k.')
  if (input.n < 1 || input.n > 20) throw new Error('n must be an integer from 1 to 20 (visualization cap).')
  if (input.k < 1 || input.k > 6) throw new Error('k must be an integer from 1 to 6 (visualization cap).')
  return input
}

// Binomial coefficient C(a, b), exact for the small values used here.
const comb = (a, b) => {
  if (b < 0 || b > a) return 0
  let r = 1
  for (let i = 1; i <= b; i++) r = (r * (a - b + i)) / i
  return Math.round(r)
}

export function buildTrace(input) {
  const { n, k } = input
  let idx = n - 1
  let value = 0
  const frames = [{ phase: 'start', activeLine: L('idx = n - 1'), bit: -1, idx, value, message: `Find the ${n}-th smallest integer with ${k} one bit(s), counting from zero.` }]
  for (let i = k; i >= 1; i--) {
    let c = i - 1
    while (comb(c + 1, i) <= idx) c++
    value += 2 ** c
    idx -= comb(c, i)
    frames.push({ phase: 'choose', activeLine: L('c = largest position'), bit: c, idx, value, message: `Place one bit at position ${c}. Remaining rank: ${idx}. Value so far: ${value}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return value'), bit: -1, idx, value, message: `The ${n}-th smallest integer is ${value}.` })
  return { input, result: value, frames }
}

export const code = `find nth smallest with k one bits (n, k):
  idx = n - 1
  value = 0
  for i from k down to 1
    c = largest position such that C(c, i) is at most idx
    set bit c in value
    subtract C(c, i) from idx
  return value`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_nth_smallest_integer_with_k_one_bits(n, k):
    from math import comb
    idx = n - 1
    value = 0
    for i in range(k, 0, -1):
        c = i - 1
        while comb(c + 1, i) <= idx:
            c += 1
        value |= 1 << c
        idx -= comb(c, i)
    return value
`
