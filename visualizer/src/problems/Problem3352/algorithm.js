export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || !/^1[01]{0,11}$/.test(s)) throw new Error('s is a binary string of up to 12 digits with no leading zero.')
  if (!Number.isInteger(k) || k < 1 || k > 6) throw new Error('k is an integer from 1 to 6.')
  return { s, k }
}

const choose = (n, r) => {
  if (r < 0 || r > n) return 0
  let value = 1
  for (let i = 1; i <= r; i++) value = (value * (n - r + i)) / i
  return Math.round(value)
}

const popcount = v => v.toString(2).split('').filter(c => c === '1').length

// Operations from v to reach 1, where each operation replaces v with its popcount.
const stepsTo1 = v => {
  let t = 0
  let x = v
  while (x !== 1) { x = popcount(x); t++ }
  return t
}

export function buildTrace({ s, k }) {
  const N = parseInt(s, 2)
  const len = s.length
  const frames = [{ phase: 'start', activeLine: L('total starts at 0'), popcount: 0, count: 0, message: `Count x in [1, ${N}) that reach 1 within ${k} operations.` }]
  // Number of x in [0, N) with exactly c ones in binary.
  const countWithOnes = c => {
    let total = 0
    let ones = 0
    for (let i = 0; i < len; i++) {
      if (s[i] !== '1') continue
      const free = len - 1 - i
      total += choose(free, c - ones)
      ones++
    }
    return total
  }
  let total = N > 1 ? 1 : 0
  frames.push({ phase: 'one', activeLine: L('add 1 when'), popcount: 1, count: total, message: N > 1 ? 'x = 1 needs 0 operations, so it always counts.' : 'No x fits below N.' })
  for (let c = 1; c <= len; c++) {
    let cnt = countWithOnes(c)
    if (c === 1 && N > 1) cnt -= 1
    const ok = 1 + stepsTo1(c) <= k
    if (ok) total += cnt
    frames.push({ phase: 'class', activeLine: L('for each popcount c'), popcount: c, count: total, message: `Numbers with ${c} ones: ${cnt}, ${ok ? 'they reach 1 in time' : 'too many steps'}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), popcount: len, count: total, message: `k-reducible numbers below ${N}: ${total}.` })
  return { input: { s, k }, result: total, frames }
}

export const code = `N is the number s read in binary, and total starts at 0
steps(v) is the number of popcount operations to reach 1 from v
add 1 when N is above 1, since x = 1 needs no operations
for each popcount c from 1 to the length of s do
  count the x below N with exactly c ones, using binomial coefficients
  keep those x when 1 + steps(c) is at most k
return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import comb

def count_k_reducible(s, k):
    N = int(s, 2)
    length = len(s)

    def steps(v):
        t = 0
        while v != 1:
            v = bin(v).count('1')
            t += 1
        return t

    total = 1 if N > 1 else 0
    for c in range(1, length + 1):
        cnt = 0
        ones = 0
        for i, ch in enumerate(s):
            if ch == '1':
                free = length - 1 - i
                if 0 <= c - ones <= free:
                    cnt += comb(free, c - ones)
                ones += 1
        if c == 1 and N > 1:
            cnt -= 1
        if 1 + steps(c) <= k:
            total += cnt
    return total
`
