const MOD = 1000000007n
const K = 8

export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('Use an object with n and max_value.')
  if (!Number.isInteger(o.n) || o.n < 1 || o.n > 12) throw new Error('n must be an integer from 1 to 12.')
  if (!Number.isInteger(o.max_value) || o.max_value < 1 || o.max_value > 40) throw new Error('max_value must be an integer from 1 to 40.')
  return { n: o.n, max_value: o.max_value }
}

const binom = (a, b) => {
  if (b < 0 || b > a) return 0n
  let r = 1n
  for (let i = 0; i < b; i++) r = (r * BigInt(a - i)) / BigInt(i + 1)
  return r
}

const describe = row => row.slice(1).map((count, i) => (count ? `length ${i + 1}: ${count}` : null)).filter(Boolean).join(', ') || 'none'

export function buildTrace({ n, max_value: maxV }) {
  const chains = Array.from({ length: maxV + 1 }, () => new Array(K).fill(0n))
  const frames = [{ phase: 'start', activeLine: L('set answer to zero'), v: 0, total: 0, message: `Count arrays of length ${n} whose values are at most ${maxV}.` }]
  let answer = 0n
  for (let v = 1; v <= maxV; v++) {
    chains[v][1] = 1n
    for (let u = 1; u < v; u++) if (v % u === 0) for (let k = 1; k < K - 1; k++) chains[v][k + 1] += chains[u][k]
    frames.push({ phase: 'chains', activeLine: L('count the chains ending at v'), v, total: Number(answer % MOD), message: `Divisor chains ending at ${v}: ${describe(chains[v].map(Number))}.` })
    let contribution = 0n
    for (let k = 1; k < K; k++) contribution += chains[v][k] * binom(n - 1, k - 1)
    answer += contribution
    frames.push({ phase: 'add', activeLine: L('add chains(v, k)'), v, total: Number(answer % MOD), message: `Adds ${contribution} arrays that end at ${v}.` })
  }
  const result = Number(answer % MOD)
  frames.push({ phase: 'done', activeLine: L('return answer modulo'), v: maxV, total: result, message: `Ideal arrays: ${result}.` })
  const chainTotals = chains.map(row => Number(row.reduce((a, b) => a + b, 0n)))
  return { input: { n, max_value: maxV }, result, frames, chainTotals }
}

export const code = `count ideal arrays of length n with values from 1 to max_value
  each element is a multiple of the element before it, so the values form a divisor chain
  set answer to zero
  for each end value v from 1 to max_value
    count the chains ending at v, grouped by their length k
    for each chain length k
      add chains(v, k) times choose(n - 1, k - 1) to the answer
  return answer modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import comb


def count_ideal_arrays(n, max_value):
    MOD = 10 ** 9 + 7
    K = 8
    chains = [[0] * K for _ in range(max_value + 1)]
    for u in range(1, max_value + 1):
        chains[u][1] += 1
        for v in range(2 * u, max_value + 1, u):
            for k in range(1, K - 1):
                chains[v][k + 1] += chains[u][k]
    answer = 0
    for v in range(1, max_value + 1):
        for k in range(1, K):
            answer += chains[v][k] * comb(n - 1, k - 1)
    return answer % MOD
`
