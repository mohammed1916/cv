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

// The binary search that exponentBefore runs for n: the range [lo, hi] and the block tested each step.
function searchSteps(n) {
  let lo = 0
  let hi = 1
  while (blocks(hi)[0] <= n) hi *= 2
  const top = hi
  const steps = []
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2)
    const ok = blocks(mid)[0] <= n
    steps.push({ lo, hi, mid, ok, entries: blocks(mid)[0] })
    if (ok) lo = mid
    else hi = mid
  }
  steps.top = top
  return steps
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
  frames.push({ pythonLine: 39, phase: 'start', activeLine: L('const results = []'), query: -1, total: null, value: null, message: 'Answer each query from exponent sums.' })
  const pyLine = text => python.split('\n').findIndex(line => line.includes(text)) + 1
  queries.forEach(([from, to, mod], index) => {
    const steps = searchSteps(to + 1)
    steps.forEach(step => frames.push({ pythonLine: pyLine('mid = (lo + hi)'), phase: 'search', activeLine: L('const mid = Math.floor'), query: index, total: null, value: null, lo: step.lo, hi: step.hi, mid: step.mid, ok: step.ok, top: steps.top, message: `Block search for n = ${to + 1}: test block ${step.mid}; it holds ${step.entries} entries, ${step.ok ? 'at most' : 'more than'} ${to + 1}, so the range becomes ${step.ok ? `${step.mid} to ${step.hi}` : `${step.lo} to ${step.mid}`}.` }))
    const total = exponentBefore(to + 1) - exponentBefore(from)
    frames.push({ pythonLine: 41, phase: 'exponent', activeLine: L('const total = exponentBefore'), query: index, total, value: null, message: `Query ${index}: the range has exponent sum ${total}.` })
    const value = powMod(total, mod)
    results.push(value)
    frames.push({ pythonLine: 42, phase: 'power', activeLine: L('results.push(powMod(2, total, mod))'), query: index, total, value, message: `2 raised to ${total}, modulo ${mod}, is ${value}.` })
  })
  frames.push({ pythonLine: 43, phase: 'done', activeLine: L('return results'), query: -1, total: null, value: null, message: `Answers: ${results.join(', ')}.` })
  return { input: { queries }, result: results, frames }
}

export const code = `function productOfBigNums(queries) {
  const countBit = (m, b) => {
    const period = 2 ** (b + 1)
    const half = 2 ** b
    return Math.floor((m + 1) / period) * half + Math.max(0, (m + 1) % period - half)
  }
  const blocks = m => {
    let entries = 0
    let exps = 0
    for (let b = 0; 2 ** b <= m; b++) {
      const c = countBit(m, b)
      entries += c
      exps += c * b
    }
    return [entries, exps]
  }
  const exponentBefore = n => {
    let lo = 0
    let hi = 1
    while (blocks(hi)[0] <= n) hi *= 2
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2)
      if (blocks(mid)[0] <= n) lo = mid
      else hi = mid
    }
    let [entries, total] = blocks(lo)
    let rest = n - entries
    const x = lo + 1
    for (let b = 0; rest > 0; b++) {
      if ((x >> b) & 1) {
        total += b
        rest -= 1
      }
    }
    return total
  }
  const results = []
  for (const [from, to, mod] of queries) {
    const total = exponentBefore(to + 1) - exponentBefore(from)
    results.push(powMod(2, total, mod))
  }
  return results
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
