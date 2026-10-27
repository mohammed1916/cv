const MOD = 1000000007n

export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || typeof o !== 'object') throw new Error('Use an object with integers n, x and y.')
  for (const [name, lo, hi] of [['n', 1, 8], ['x', 1, 6], ['y', 1, 5]]) {
    if (!Number.isInteger(o[name]) || o[name] < lo || o[name] > hi) throw new Error(`${name} must be an integer from ${lo} to ${hi}.`)
  }
  return { n: o.n, x: o.x, y: o.y }
}

// Stirling numbers of the second kind: ways to split i performers into j non-empty groups.
const stirling = n => {
  const S = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0n))
  S[0][0] = 1n
  for (let i = 1; i <= n; i++) for (let j = 1; j <= i; j++) S[i][j] = BigInt(j) * S[i - 1][j] + S[i - 1][j - 1]
  return S
}

export function buildTrace({ n, x, y }) {
  const S = stirling(n)
  const terms = []
  let total = 0n
  const frames = [{ phase: 'start', activeLine: L('set total to zero'), j: 0, total: 0, message: `${n} performers, ${x} stages, scores from 1 to ${y}.` }]
  for (let j = 1; j <= Math.min(n, x); j++) {
    let perm = 1n
    for (let t = 0; t < j; t++) perm *= BigInt(x - t)
    const term = S[n][j] * perm * BigInt(y) ** BigInt(j)
    total += term
    terms.push({ j, term: Number(term % MOD) })
    frames.push({ phase: 'term', activeLine: L('for each number of used stages'), j, total: Number(total % MOD), message: `${j} used stage(s): ${S[n][j]} groupings, ${perm} stage choices, ${y}^${j} scores.` })
  }
  const result = Number(total % MOD)
  frames.push({ phase: 'done', activeLine: L('return total modulo'), j: Math.min(n, x), total: result, message: `Possible ways: ${result}.` })
  return { input: { n, x, y }, result, frames, terms }
}

export const code = `count ways for n performers on x stages with scores from 1 to y
  set total to zero
  for each number of used stages j from one to the smaller of n and x
    let s be the number of ways to split the n performers into j non-empty groups
    let p be x times (x minus 1) down to (x minus j plus 1), the ways to give the groups distinct stages
    add s times p times y to the power j to total
  return total modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_ways(n, x, y):
    MOD = 10 ** 9 + 7
    S = [[0] * (n + 1) for _ in range(n + 1)]
    S[0][0] = 1
    for i in range(1, n + 1):
        for j in range(1, i + 1):
            S[i][j] = (j * S[i - 1][j] + S[i - 1][j - 1]) % MOD

    total = 0
    perm = 1
    power = 1
    for j in range(1, min(n, x) + 1):
        perm = perm * (x - j + 1) % MOD
        power = power * y % MOD
        total = (total + S[n][j] * perm % MOD * power) % MOD
    return total
`
