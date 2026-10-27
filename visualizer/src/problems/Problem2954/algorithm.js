const MOD = 1000000007n

export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || !Number.isInteger(o.n) || !Array.isArray(o.sick)) throw new Error('Use an object with an integer n and a sick array.')
  const { n, sick } = o
  if (n < 2 || n > 10) throw new Error('n must be an integer from 2 to 10.')
  if (sick.length < 1 || sick.length > n - 1) throw new Error('sick must have between 1 and n - 1 entries.')
  if (sick.some(v => !Number.isInteger(v) || v < 0 || v >= n)) throw new Error('sick entries are positions from 0 to n - 1.')
  if (sick.some((v, i) => i > 0 && v <= sick[i - 1])) throw new Error('sick must be strictly increasing.')
  return { n, sick }
}

const powmod = (b, e) => {
  let r = 1n
  let base = BigInt(b) % MOD
  let exp = BigInt(e)
  while (exp > 0n) {
    if (exp & 1n) r = (r * base) % MOD
    base = (base * base) % MOD
    exp >>= 1n
  }
  return r
}

const factmod = m => {
  let r = 1n
  for (let i = 2; i <= m; i++) r = (r * BigInt(i)) % MOD
  return r
}

export function buildTrace({ n, sick }) {
  const healthy = n - sick.length
  const gaps = [{ length: sick[0], between: false }]
  for (let i = 0; i + 1 < sick.length; i++) gaps.push({ length: sick[i + 1] - sick[i] - 1, between: true })
  gaps.push({ length: n - 1 - sick[sick.length - 1], between: false })
  let answer = factmod(healthy)
  const frames = [{ phase: 'start', activeLine: L('set answer to the factorial'), gap: -1, total: Number(answer), message: `${healthy} healthy children can be infected in any interleaving, before the gap correction.` }]
  gaps.forEach((gap, index) => {
    answer = (answer * powmod(factmod(gap.length), MOD - 2n)) % MOD
    let note = `divide by ${gap.length}!`
    if (gap.between && gap.length > 0) {
      answer = (answer * powmod(2n, gap.length - 1)) % MOD
      note += ` and multiply by 2^${gap.length - 1} (infected from either end)`
    }
    frames.push({ phase: 'gap', activeLine: L('for each gap'), gap: index, total: Number(answer), message: `Gap ${index} of length ${gap.length}: ${note}.` })
  })
  const result = Number(answer)
  frames.push({ phase: 'done', activeLine: L('return answer'), gap: gaps.length - 1, total: result, message: `Infection sequences: ${result}.` })
  return { input: { n, sick }, result, frames, gaps }
}

export const code = `count orders in which the healthy children can become infected
  let healthy be the number of children that start healthy
  let each gap be a run of healthy children at an end or between two sick children
  set answer to the factorial of healthy, modulo 1000000007
  for each gap
    divide answer by the factorial of the gap length
    if the gap lies between two sick children and is not empty then
      multiply answer by two to the power of (gap length minus one)
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def infection_sequences(n, sick):
    MOD = 10 ** 9 + 7
    healthy = n - len(sick)
    gaps = [(sick[0], False)]
    for left, right in zip(sick, sick[1:]):
        gaps.append((right - left - 1, True))
    gaps.append((n - 1 - sick[-1], False))

    answer = 1
    for i in range(1, healthy + 1):
        answer = answer * i % MOD
    for length, between in gaps:
        fact = 1
        for i in range(1, length + 1):
            fact = fact * i % MOD
        answer = answer * pow(fact, MOD - 2, MOD) % MOD
        if between and length > 0:
            answer = answer * pow(2, length - 1, MOD) % MOD
    return answer
`
