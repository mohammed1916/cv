const MOD = 1000000007

// With a = (x-1)(y-1) - 1, the value a*b-a-b is even exactly when both a and b are even.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, m and k.')
  const { n, m, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('n is an integer from 1 to 12.')
  if (!Number.isInteger(m) || m < 1 || m > 30) throw new Error('m is an integer from 1 to 30.')
  if (!Number.isInteger(k) || k < 0 || k > 11) throw new Error('k is an integer from 0 to 11.')
  return { n, m, k }
}

const mul = (a, b) => Number(BigInt(a) * BigInt(b) % BigInt(MOD))

export const code = `count length-n arrays with entries 1 to m and exactly k good adjacent pairs
  a pair is good when both entries are even
  evens = floor(m / 2)
  odds = m minus evens
  if k is at least n then return 0
  ev[c] = ways to end on an even entry with c good pairs, for c from 0 to k
  od[c] = ways to end on an odd entry with c good pairs, for c from 0 to k
  ev[0] = evens and od[0] = odds for length 1, all other counts 0
  for each new position from 2 to n
    new_ev[c] = ev[c minus 1] * evens + od[c] * evens
    new_od[c] = (ev[c] + od[c]) * odds
    replace ev and od with new_ev and new_od
  return (ev[k] + od[k]) modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_k_even(n, m, k):
    MOD = 1000000007
    evens = m // 2
    odds = m - evens
    if k >= n:
        return 0
    ev = [0] * (k + 1)
    od = [0] * (k + 1)
    ev[0] = evens
    od[0] = odds
    for _ in range(2, n + 1):
        new_ev = [0] * (k + 1)
        new_od = [0] * (k + 1)
        for c in range(k + 1):
            if c >= 1:
                new_ev[c] = (new_ev[c] + ev[c - 1] * evens) % MOD
            new_ev[c] = (new_ev[c] + od[c] * evens) % MOD
            new_od[c] = (ev[c] + od[c]) * odds % MOD
        ev, od = new_ev, new_od
    return (ev[k] + od[k]) % MOD
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ n, m, k }) {
  const frames = []
  const evens = Math.floor(m / 2)
  const odds = m - evens
  const state = { ev: [], od: [], length: 0, result: null }
  const push = (phase, codeText, pyText, message, extra = {}) => {
    frames.push({
      phase, activeLine: L(codeText), pythonLine: P(pyText), message,
      n, m, k, evens, odds, length: state.length,
      ev: [...state.ev], od: [...state.od], result: state.result, ...extra,
    })
  }

  push('setup', 'evens = floor(m / 2)', 'evens = m // 2', `${evens} even and ${odds} odd value${odds === 1 ? '' : 's'} are available.`)
  if (k >= n) {
    state.result = 0
    push('done', 'if k is at least n then return 0', 'return 0', `k = ${k} needs at least ${k + 1} entries, but n = ${n}, so there are no arrays.`)
    return { input: { n, m, k }, result: 0, frames }
  }
  state.ev = Array.from({ length: k + 1 }, (_, c) => (c === 0 ? evens : 0))
  state.od = Array.from({ length: k + 1 }, (_, c) => (c === 0 ? odds : 0))
  state.length = 1
  push('init', 'ev[0] = evens and od[0] = odds', 'ev[0] = evens', 'Length 1: no pairs yet, so every array has 0 good pairs.')

  for (let step = 2; step <= n; step += 1) {
    const nextEv = Array(k + 1).fill(0)
    const nextOd = Array(k + 1).fill(0)
    for (let c = 0; c <= k; c += 1) {
      let fromEvenGood = 0
      if (c >= 1) fromEvenGood = mul(state.ev[c - 1], evens)
      nextEv[c] = (fromEvenGood + mul(state.od[c], evens)) % MOD
      nextOd[c] = mul((state.ev[c] + state.od[c]) % MOD, odds)
    }
    state.ev = nextEv
    state.od = nextOd
    state.length = step
    push('extend', 'for each new position from 2 to n', 'for _ in range(2, n + 1)', `Length ${step}: an even entry after an even entry adds a good pair.`, { changed: step })
  }

  const result = (state.ev[k] + state.od[k]) % MOD
  state.result = result
  push('done', 'return (ev[k] + od[k]) modulo 1000000007', 'return (ev[k] + od[k]) % MOD', `Arrays of length ${n} with exactly ${k} good pairs: ${result}.`, { result })
  return { input: { n, m, k }, result, frames }
}
