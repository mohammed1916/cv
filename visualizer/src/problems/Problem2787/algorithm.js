export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.n) || !Number.isInteger(obj.x)) throw new Error('Use {"n": integer, "x": integer}.')
  if (obj.n < 1 || obj.n > 60) throw new Error('n is an integer from 1 to 60.')
  if (obj.x < 1 || obj.x > 5) throw new Error('x is an integer from 1 to 5.')
  return { n: obj.n, x: obj.x }
}

export function buildTrace(input) {
  const MOD = 1000000007
  const { n, x } = input
  const ways = Array(n + 1).fill(0)
  ways[0] = 1
  const frames = [{ phase: 'start', activeLine: L('set ways[0] to 1'), base: null, power: null, ways: ways.slice(), answer: null, message: `Count sets of distinct bases whose ${x}-th powers add up to ${n}.` }]
  for (let i = 1; i ** x <= n; i++) {
    const p = i ** x
    for (let s = n; s >= p; s--) ways[s] = (ways[s] + ways[s - p]) % MOD
    frames.push({ phase: 'base', activeLine: L('add ways[s - p]'), base: i, power: p, ways: ways.slice(), answer: null, message: `Base ${i} contributes ${p}: sums that use it are added to the table.` })
  }
  const answer = ways[n] % MOD
  frames.push({ phase: 'done', activeLine: L('return ways[n]'), base: null, power: null, ways: ways.slice(), answer, message: `Ways to express ${n}: ${answer}.` })
  return { input, result: answer, frames }
}

export const code = `count sets of distinct bases whose x-th powers sum to n:
  set ways[0] to 1 and every other entry to 0
  for each base i from 1 while i to the power x is at most n:
    let p be i to the power x
    for s from n down to p:
      add ways[s - p] into ways[s]
  return ways[n] modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def ways_to_express(n, x):
    MOD = 1000000007
    ways = [0] * (n + 1)
    ways[0] = 1
    i = 1
    while i ** x <= n:
        p = i ** x
        for s in range(n, p - 1, -1):
            ways[s] = (ways[s] + ways[s - p]) % MOD
        i += 1
    return ways[n] % MOD
`
