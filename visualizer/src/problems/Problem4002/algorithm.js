export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and k.')
  const { n, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 30) throw new Error('n is an integer from 1 to 30.')
  if (!Number.isInteger(k) || k < 1 || k > n) throw new Error('k is an integer from 1 to n.')
  return { n, k }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

const MOD = 1000000007n

function powMod(base, exp) {
  let result = 1n
  let x = base % MOD
  let e = exp
  while (e > 0n) {
    if (e & 1n) result = (result * x) % MOD
    x = (x * x) % MOD
    e >>= 1n
  }
  return result
}

// C(a, b) modulo MOD, built from a running product and modular inverses.
export function choose(a, b) {
  if (b < 0 || b > a) return 0n
  let result = 1n
  for (let i = 0; i < b; i++) {
    result = (result * BigInt(a - i)) % MOD
    result = (result * powMod(BigInt(i + 1), MOD - 2n)) % MOD
  }
  return result
}

export function buildTrace({ n, k }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)
  const base = { n, k, parity: null, odd: null, answer: null, total: null }

  // Exact counts are shown while n is small; the result itself is always reduced modulo MOD.
  const total = choose(n - 1, k - 1)
  const totalExact = exactChoose(n - 1, k - 1)
  frames.push({ ...base, phase: 'total', activeLine: L('total = choose'), pythonLine: P('total = nck'), total: totalExact, message: `Cutting ${n} into ${k} positive parts gives ${totalExact} ordered sequences before the parity filter.` })

  const parityOk = (n - k) % 2 === 0
  frames.push({ ...base, total: totalExact, phase: 'parity', activeLine: L('if n minus k is even'), pythonLine: P('if (n - k) % 2 == 0'), parity: parityOk, message: parityOk ? `n - k = ${n - k} is even, so all-odd sequences are possible.` : `n - k = ${n - k} is odd, so every sequence has an even part.` })

  let odd = 0n
  if (parityOk) {
    const m = (n - k) / 2 + k - 1
    odd = choose(m, k - 1)
    frames.push({ ...base, total: totalExact, parity: true, odd: odd.toString(), phase: 'odd', activeLine: L('odd = choose'), pythonLine: P('odd = nck('), message: `All-odd sequences: C(${m}, ${k - 1}) = ${exactChoose(m, k - 1)}.` })
  } else {
    frames.push({ ...base, total: totalExact, parity: false, odd: '0', phase: 'odd', activeLine: L('else odd = 0'), pythonLine: P('odd = 0'), message: 'No all-odd sequence exists, so none is subtracted.' })
  }

  const answer = ((total - odd) % MOD + MOD) % MOD
  frames.push({ ...base, total: totalExact, parity: parityOk, odd: odd.toString(), answer: answer.toString(), phase: 'done', activeLine: L('return (total minus odd)'), pythonLine: P('return (total - odd)'), result: Number(answer), message: `${totalExact} minus ${odd} leaves ${answer} sequences with an even product.` })
  return { input: { n, k }, result: Number(answer), frames }
}

function exactChoose(a, b) {
  if (b < 0 || b > a) return 0n
  let result = 1n
  for (let i = 0; i < b; i++) result = (result * BigInt(a - i)) / BigInt(i + 1)
  return result.toString()
}

export const code = `count ordered sequences of k positive integers that sum to n with an even product
total = choose(n - 1, k - 1), the ways to cut n into k positive parts
if n minus k is even then all-odd sequences are possible
  odd = choose((n - k) / 2 + k - 1, k - 1)
else odd = 0
return (total minus odd) modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_valid_sequences(n, k):
    MOD = 1000000007
    def nck(a, b):
        if b < 0 or b > a:
            return 0
        result = 1
        for i in range(b):
            result = result * (a - i) % MOD * pow(i + 1, MOD - 2, MOD) % MOD
        return result
    total = nck(n - 1, k - 1)
    odd = 0
    if (n - k) % 2 == 0:
        odd = nck((n - k) // 2 + k - 1, k - 1)
    return (total - odd) % MOD
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
