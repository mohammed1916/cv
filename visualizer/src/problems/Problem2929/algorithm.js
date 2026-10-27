export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || !Number.isInteger(o.n) || !Number.isInteger(o.limit)) throw new Error('Use an object with integers n and limit.')
  if (o.n < 1 || o.n > 300) throw new Error('n must be an integer from 1 to 300.')
  if (o.limit < 1 || o.limit > 300) throw new Error('limit must be an integer from 1 to 300.')
  return { n: o.n, limit: o.limit }
}

const choose = (a, b) => {
  if (b < 0 || b > a) return 0
  let r = 1
  for (let i = 0; i < b; i++) r = (r * (a - i)) / (i + 1)
  return Math.round(r)
}
// Nonnegative triples summing to m: choose(m + 2, 2), or zero when m is negative.
const triples = m => (m >= 0 ? choose(m + 2, 2) : 0)

export function buildTrace({ n, limit }) {
  const terms = []
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to zero'), i: -1, total: 0, message: `Count splits of ${n} with each share at most ${limit}, by inclusion-exclusion.` }]
  for (let i = 0; i <= 3; i++) {
    const m = n - i * (limit + 1)
    const sign = i % 2 ? -1 : 1
    const term = m >= 0 ? sign * choose(3, i) * triples(m) : 0
    total += term
    terms.push({ i, m, term })
    frames.push({ phase: 'term', activeLine: L('for each number i'), i, total, message: `${i} child(ren) forced over the limit: term ${term} (remaining ${m}).` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), i: 3, total, message: `Total ways: ${total}.` })
  return { input: { n, limit }, result: total, frames, terms }
}

export const code = `count ways to split n candies among three children with at most limit each
  set total to zero
  for each number i of children forced over the limit from zero to three
    let m be n minus i times (limit plus one)
    if m is at least zero then
      add (-1) to the power i, times choose(3, i), times choose(m + 2, 2) to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import comb


def distribute_candies(n, limit):
    total = 0
    for i in range(4):
        m = n - i * (limit + 1)
        if m >= 0:
            total += (-1) ** i * comb(3, i) * comb(m + 2, 2)
    return total
`
