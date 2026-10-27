const MOD = 1000000007
const MAX_N = 6
const MAX_K = 20

export function parseInput(text) {
  const data = JSON.parse(text)
  const queries = data?.queries
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 4) throw new Error('queries must list 1 to 4 pairs [n, k].')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2) throw new Error('Each query is [n, k].')
    const [n, k] = q
    if (!Number.isInteger(n) || n < 1 || n > MAX_N) throw new Error(`n must be an integer from 1 to ${MAX_N}.`)
    if (!Number.isInteger(k) || k < 1 || k > MAX_K) throw new Error(`k must be an integer from 1 to ${MAX_K}.`)
  }
  return { queries }
}

function factor(k) {
  const out = []
  let x = k
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      let e = 0
      while (x % p === 0) { x /= p; e++ }
      out.push([p, e])
    }
  }
  if (x > 1) out.push([x, 1])
  return out
}

export const code = `ways for queries(queries)
  set pascal[i][0] to 1 and fill the rest of the Pascal triangle, modulo the prime
  for each query [n, k]
    set ways to 1
    for each prime p dividing k with exponent e
      multiply ways by pascal[e+n-1][n-1], modulo the prime
    add ways to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Spreading the exponent e of a prime over n positions is C(e+n-1, n-1) (stars and bars), and primes are independent.
export function buildTrace({ queries }) {
  const maxN = Math.max(...queries.map(([n]) => n))
  const factored = queries.map(([, k]) => factor(k))
  const maxE = Math.max(1, ...factored.flat().map(([, e]) => e))
  const rows = maxN + maxE
  const cols = maxN
  const pascal = Array.from({ length: rows }, () => Array(cols).fill(0))
  const frames = []
  const snap = () => pascal.map(row => [...row])
  for (let i = 0; i < rows; i++) {
    pascal[i][0] = 1
    frames.push({ phase: 'pascal', cell: [i, 0], table: snap(), query: null, answers: [], activeLine: L('set pascal[i][0]'), message: `C(${i}, 0) = 1.` })
    for (let j = 1; j <= Math.min(i, cols - 1); j++) {
      pascal[i][j] = (pascal[i - 1][j - 1] + pascal[i - 1][j]) % MOD
      frames.push({ phase: 'pascal', cell: [i, j], table: snap(), query: null, answers: [], activeLine: L('set pascal[i][0]'), message: `C(${i}, ${j}) = ${pascal[i][j]}.` })
    }
  }
  const answers = []
  queries.forEach(([n, k], index) => {
    let ways = 1
    for (const [, e] of factored[index]) ways = (ways * pascal[e + n - 1][n - 1]) % MOD
    answers.push(ways)
    const primes = factored[index].map(([p, e]) => `${p}^${e}`).join(' ') || 'none (k = 1)'
    frames.push({ phase: 'query', cell: null, table: snap(), query: index, answers: [...answers], activeLine: L('add ways to answers'), message: `Query [${n}, ${k}]: prime powers ${primes}, so ${ways} arrays.` })
  })
  frames.push({ phase: 'done', cell: null, table: snap(), query: null, answers: [...answers], activeLine: L('return answers'), result: answers, message: `Answers: ${answers.join(', ')}.` })
  return { input: { queries }, result: answers, frames }
}

export const python = `def ways_to_make_product(queries):
    MOD = 1000000007

    def factor(k):
        out = []
        p = 2
        while p * p <= k:
            if k % p == 0:
                e = 0
                while k % p == 0:
                    k //= p
                    e += 1
                out.append((p, e))
            p += 1
        if k > 1:
            out.append((k, 1))
        return out

    max_n = max(n for n, _ in queries)
    factored = [factor(k) for _, k in queries]
    max_e = max([1] + [e for f in factored for _, e in f])
    rows, cols = max_n + max_e, max_n
    pascal = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        pascal[i][0] = 1
        for j in range(1, min(i, cols - 1) + 1):
            pascal[i][j] = (pascal[i - 1][j - 1] + pascal[i - 1][j]) % MOD
    answers = []
    for (n, _), f in zip(queries, factored):
        ways = 1
        for _, e in f:
            ways = ways * pascal[e + n - 1][n - 1] % MOD
        answers.append(ways)
    return answers
`
