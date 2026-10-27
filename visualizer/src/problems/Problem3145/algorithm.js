export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with one key, queries.')
  const { queries } = data
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries must be an array of 1 to 6 triples.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 3) throw new Error('Each query is [from, to, mod].')
    const [from, to, mod] = q
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < from || to > 300) throw new Error('Indices must satisfy 0 <= from <= to <= 300.')
    if (!Number.isInteger(mod) || mod < 1 || mod > 1000) throw new Error('mod must be an integer from 1 to 1000.')
  }
  return { queries }
}

// Numbers in 0..m with bit b set.
function countBit(m, b) {
  const period = 2 ** (b + 1)
  const half = 2 ** b
  return Math.floor((m + 1) / period) * half + Math.max(0, ((m + 1) % period) - half)
}

// Blocks 1..m of big_nums: block x holds the powers of two of the set bits of x, lowest first.
function blocks(m) {
  let entries = 0
  let exps = 0
  for (let b = 0; 2 ** b <= m; b++) {
    const c = countBit(m, b)
    entries += c
    exps += c * b
  }
  return { entries, exps }
}

// Sum of the exponents of the first n entries of big_nums.
function exponentBefore(n) {
  let lo = 0
  let hi = 1
  while (blocks(hi).entries <= n) hi *= 2
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2)
    if (blocks(mid).entries <= n) lo = mid
    else hi = mid
  }
  const whole = blocks(lo)
  let rest = n - whole.entries
  let total = whole.exps
  const x = lo + 1
  for (let b = 0; rest > 0; b++) {
    if ((x >> b) & 1) {
      total += b
      rest--
    }
  }
  return total
}

function powMod(exp, mod) {
  const m = BigInt(mod)
  let result = BigInt(1) % m
  let base = BigInt(2) % m
  let e = BigInt(exp)
  while (e > BigInt(0)) {
    if (e & BigInt(1)) result = (result * base) % m
    base = (base * base) % m
    e >>= BigInt(1)
  }
  return Number(result)
}

export function buildTrace({ queries }) {
  const frames = []
  const results = []
  frames.push({ phase: 'start', activeLine: L('set results to an empty list'), query: -1, total: null, value: null, message: 'Answer each query from exponent sums.' })
  queries.forEach(([from, to, mod], index) => {
    const total = exponentBefore(to + 1) - exponentBefore(from)
    frames.push({ phase: 'exponent', activeLine: L('set total to exponent before'), query: index, total, value: null, message: `Query ${index}: the range has exponent sum ${total}.` })
    const value = powMod(total, mod)
    results.push(value)
    frames.push({ phase: 'power', activeLine: L('add 2 raised to total'), query: index, total, value, message: `2 raised to ${total}, modulo ${mod}, is ${value}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return results'), query: -1, total: null, value: null, message: `Answers: ${results.join(', ')}.` })
  return { input: { queries }, result: results, frames }
}

export const code = `product of big_nums from index from to index to, modulo mod
  set results to an empty list
  for each query [from, to, mod] do
    set total to exponent before (to + 1) minus exponent before from
    add 2 raised to total, taken modulo mod, to results
  return results
exponent before n, the sum of exponents of the first n entries
  find the largest m whose blocks 1 to m hold at most n entries
  set total to the exponent sum of blocks 1 to m
  add the bit positions of the first (n minus entries of blocks 1 to m) set bits of block m + 1
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def product_of_big_nums(queries):
    def count_bit(m, b):
        period = 1 << (b + 1)
        half = 1 << b
        return (m + 1) // period * half + max(0, (m + 1) % period - half)

    def blocks(m):
        entries = 0
        exps = 0
        b = 0
        while (1 << b) <= m:
            c = count_bit(m, b)
            entries += c
            exps += c * b
            b += 1
        return entries, exps

    def exponent_before(n):
        lo, hi = 0, 1
        while blocks(hi)[0] <= n:
            hi *= 2
        while hi - lo > 1:
            mid = (lo + hi) // 2
            if blocks(mid)[0] <= n:
                lo = mid
            else:
                hi = mid
        entries, total = blocks(lo)
        rest = n - entries
        x = lo + 1
        b = 0
        while rest > 0:
            if (x >> b) & 1:
                total += b
                rest -= 1
            b += 1
        return total

    results = []
    for frm, to, mod in queries:
        e = exponent_before(to + 1) - exponent_before(frm)
        results.append(pow(2, e, mod))
    return results
`
