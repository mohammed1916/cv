const MOD = 1000000007n

const gcd = (a, b) => {
  let x = a < 0n ? -a : a
  let y = b
  while (y) [x, y] = [y, x % y]
  return x
}
const frac = (num, den = 1n) => {
  const g = gcd(num, den)
  return { num: num / g, den: den / g }
}
const mul = (x, y) => frac(x.num * y.num, x.den * y.den)
const div = (x, y) => frac(x.num * y.den, x.den * y.num)
const show = x => (x.den === 1n ? `${x.num}` : `${x.num}/${x.den}`)
const powMod = (base, exp) => {
  let result = 1n
  let b = base % MOD
  let e = exp
  while (e > 0n) {
    if (e & 1n) result = (result * b) % MOD
    b = (b * b) % MOD
    e >>= 1n
  }
  return result
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, conversions and queries.')
  const { n, conversions, queries } = input
  if (!Number.isInteger(n) || n < 2 || n > 8) throw new Error('n is an integer from 2 to 8.')
  if (!Array.isArray(conversions) || conversions.length !== n - 1) throw new Error('conversions holds exactly n - 1 triples.')
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const row of conversions) {
    if (!Array.isArray(row) || row.length !== 3) throw new Error('Each conversion is [a, b, f].')
    const [a, b, f] = row
    if (![a, b].every(u => Number.isInteger(u) && u >= 0 && u < n) || a === b) throw new Error('Units are numbered 0 to n - 1 and a conversion joins two different units.')
    if (!Number.isInteger(f) || f < 1 || f > 9) throw new Error('Each factor f is an integer from 1 to 9.')
    const ra = find(a)
    const rb = find(b)
    if (ra === rb) throw new Error('The conversions must not form a cycle.')
    parent[ra] = rb
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries is a list of 1 to 6 pairs.')
  for (const pair of queries) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(u => Number.isInteger(u) && u >= 0 && u < n)) throw new Error('Each query is a pair of unit numbers.')
  }
  return { n, conversions, queries }
}

export function buildTrace({ n, conversions, queries }) {
  const graph = Array.from({ length: n }, () => [])
  for (const [a, b, f] of conversions) {
    graph[a].push({ to: b, factor: frac(BigInt(f)), via: [a, b, f] })
    graph[b].push({ to: a, factor: frac(1n, BigInt(f)), via: [a, b, f] })
  }
  const amount = Array(n).fill(null)
  amount[0] = frac(1n)
  const answers = queries.map(() => null)
  const snapshot = () => amount.map(x => (x ? show(x) : null))
  const frames = []
  frames.push({ pythonLine: P('amount = [None]'), phase: 'start', activeLine: L('set the amount of unit 0'), current: 0, edge: null, amount: snapshot(), answers: [...answers], message: 'Unit 0 is the reference, so its amount is 1.' })
  const queue = [0]
  while (queue.length) {
    const u = queue.shift()
    frames.push({ pythonLine: P('while queue'), phase: 'spread', activeLine: L('breadth first search'), current: u, edge: null, amount: snapshot(), answers: [...answers], message: `Expand unit ${u}, whose amount is ${show(amount[u])}.` })
    for (const { to, factor, via } of graph[u]) {
      if (amount[to]) continue
      amount[to] = mul(amount[u], factor)
      queue.push(to)
      frames.push({ pythonLine: P('amount[v] = amount[u]'), phase: 'assign', activeLine: L('set the amount of v'), current: to, edge: via, amount: snapshot(), answers: [...answers], message: `Unit ${to} is worth ${show(amount[to])} in reference units.` })
    }
  }
  queries.forEach(([a, b], k) => {
    const ratio = div(amount[b], amount[a])
    answers[k] = (ratio.num * powMod(ratio.den, MOD - 2n)) % MOD
    frames.push({ pythonLine: P('ratio = amount[b]'), phase: 'query', activeLine: L('reduce amount of b'), current: b, edge: null, amount: snapshot(), answers: [...answers], message: `Query [${a}, ${b}]: one ${a} equals ${show(ratio)} of ${b}, which is ${answers[k]} modulo 1000000007.` })
  })
  frames.push({ pythonLine: P('return answers'), phase: 'done', activeLine: L('return all answers'), current: null, edge: null, amount: snapshot(), answers: [...answers], message: 'Every query now has its modular answer.' })
  return { input: { n, conversions, queries }, result: answers.map(x => Number(x)), frames }
}

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const code = `unit conversion ratios on a tree of units
  build a graph where each conversion gives a forward and a backward factor
  set the amount of unit 0 to 1
  breadth first search from unit 0
  for each neighbor v of u not yet valued
    set the amount of v to the amount of u times the factor
  for each query [a, b]
    reduce amount of b divided by amount of a to p over q
    answer p times the inverse of q modulo 1000000007
  return all answers`.split('\n').map((text, index) => ({ line: index + 1, text: text.trimEnd() }))

export const python = `from collections import deque
from fractions import Fraction

MOD = 1000000007

def unit_conversion(n, conversions, queries):
    graph = [[] for _ in range(n)]
    for a, b, f in conversions:
        graph[a].append((b, Fraction(f)))
        graph[b].append((a, Fraction(1, f)))
    amount = [None] * n
    amount[0] = Fraction(1)
    queue = deque([0])
    while queue:
        u = queue.popleft()
        for v, factor in graph[u]:
            if amount[v] is None:
                amount[v] = amount[u] * factor
                queue.append(v)
    answers = []
    for a, b in queries:
        ratio = amount[b] / amount[a]
        answers.append(ratio.numerator * pow(ratio.denominator, MOD - 2, MOD) % MOD)
    return answers
`
