const LIMIT = 1000000000000000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with n and k.')
  const { n, k } = input
  if (!Number.isSafeInteger(n) || n < 1 || n > LIMIT) throw new Error('n must be an integer from 1 to 1000000000000000.')
  if (!Number.isInteger(k) || k < 0 || k > 5) throw new Error('k must be an integer from 0 to 5.')
  return { n, k }
}

// popcount-depth: 1 has depth 0; any other x has depth 1 + depth(popcount(x)).
export const depthOf = v => {
  let d = 0
  let x = v
  while (x !== 1) { x = x.toString(2).split('').filter(b => b === '1').length; d += 1 }
  return d
}

const binom = (a, b) => {
  if (b < 0 || b > a) return 0
  let r = 1
  for (let i = 1; i <= b; i++) r = (r * (a - b + i)) / i
  return Math.round(r)
}

// Numbers in [1, n] that have exactly c set bits, by walking the bits of n from the top.
export function countWithBits(n, c) {
  const bits = n.toString(2)
  const L = bits.length
  let total = 0
  let ones = 0
  for (let i = 0; i < L; i++) {
    const remaining = L - i - 1
    if (bits[i] === '1') {
      const need = c - ones
      if (need >= 0 && need <= remaining) total += binom(remaining, need)
      ones += 1
    }
  }
  if (ones === c) total += 1
  return total
}

export function buildTrace(input) {
  const { n, k } = input
  const frames = []
  if (k === 0) {
    const result = n >= 1 ? 1 : 0
    frames.push({ phase: 'zero', activeLine: L('if k is 0'), c: null, depth: 0, count: result, total: result, message: 'Only the number 1 has depth 0.' })
    frames.push({ phase: 'done', activeLine: L('return total'), c: null, depth: null, count: null, total: result, message: `Answer: ${result}.` })
    return { input: { n, k }, result, frames }
  }
  let total = 0
  const bitLength = n.toString(2).length
  for (let c = 1; c <= bitLength; c++) {
    const dc = depthOf(c)
    if (dc !== k - 1) continue
    const count = countWithBits(n, c)
    total += count
    frames.push({ phase: 'class', activeLine: L('add the count of x'), c, depth: dc, count, total, message: `${count} numbers up to ${n} have ${c} set bits and depth ${dc + 1}.` })
  }
  if (k === 1) {
    total -= 1
    frames.push({ phase: 'adjust', activeLine: L('subtract 1 for the number 1'), c: 1, depth: 0, count: -1, total, message: 'The number 1 has depth 0, not 1, so it is removed.' })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), c: null, depth: null, count: null, total, message: `Answer: ${total}.` })
  return { input: { n, k }, result: total, frames }
}

export const code = `count x from 1 to n with popcount-depth k (n, k):
  if k is 0 then return 1 when n is at least 1, else 0
  set total to 0
  for each popcount c from 1 to the bit length of n do
    if depth of c is k minus 1 then
      add the count of x up to n with c set bits to total
  if k is 1 then subtract 1 for the number 1
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import comb


def count_popcount_depth(n, k):
    def depth(v):
        d = 0
        while v != 1:
            v = bin(v).count('1')
            d += 1
        return d

    if k == 0:
        return 1 if n >= 1 else 0

    def count_with_bits(c):
        bits = bin(n)[2:]
        length = len(bits)
        total = 0
        ones = 0
        for i, ch in enumerate(bits):
            remaining = length - i - 1
            if ch == '1':
                need = c - ones
                if 0 <= need <= remaining:
                    total += comb(remaining, need)
                ones += 1
        if ones == c:
            total += 1
        return total

    total = sum(count_with_bits(c) for c in range(1, n.bit_length() + 1) if depth(c) == k - 1)
    if k == 1:
        total -= 1
    return total
`
