export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).sort().join() !== 'a,b,c') throw new Error('Use a JSON object with exactly the keys a, b and c.')
  const { a, b, c } = input
  for (const [name, w] of [['a', a], ['b', b], ['c', c]]) {
    if (typeof w !== 'string' || w.length < 1 || w.length > 6) throw new Error(`${name} must be a string of 1 to 6 letters.`)
    if (!/^[a-z]+$/.test(w)) throw new Error(`${name} may contain only lowercase letters a to z.`)
  }
  return { a, b, c }
}

// Join x and y, reusing the longest overlap, or keep the longer one when it already contains the other.
function merge(x, y) {
  if (x.includes(y)) return x
  if (y.includes(x)) return y
  for (let k = Math.min(x.length, y.length); k >= 0; k--) {
    if (x.endsWith(y.slice(0, k))) return x + y.slice(k)
  }
  return x + y
}

export function buildTrace({ a, b, c }) {
  const strings = [a, b, c]
  const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]
  let best = null
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), order: '', candidate: '', best: '', message: 'Try each order of the three strings.' }]
  for (const [p, q, r] of orders) {
    const first = merge(strings[p], strings[q])
    const candidate = merge(first, strings[r])
    const label = `${strings[p]}, ${strings[q]}, ${strings[r]}`
    if (best === null || candidate.length < best.length || (candidate.length === best.length && candidate < best)) {
      best = candidate
      frames.push({ phase: 'better', activeLine: L('set best to candidate'), order: label, candidate, best, message: `Order ${label} gives ${candidate}, which is the best so far.` })
    } else {
      frames.push({ phase: 'try', activeLine: L('let candidate be'), order: label, candidate, best, message: `Order ${label} gives ${candidate}, which is not better than ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), order: '', candidate: '', best, message: `Shortest string: ${best}.` })
  return { input: { a, b, c }, result: best, frames }
}

export const code = `shortest string containing a, b and c:
  set best to nothing
  for each order p, q, r of the three strings
    let first be the merge of p and q
    let candidate be the merge of first and r
    if best is nothing or candidate is shorter than best then
      set best to candidate
    otherwise if candidate has the same length as best and is smaller then
      set best to candidate
  return best
merge of x and y
  if x contains y then return x
  if y contains x then return y
  find the longest suffix of x that is also a prefix of y
  return x followed by the rest of y`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shortest_string_with_three(a, b, c):
    def merge(x, y):
        if y in x:
            return x
        if x in y:
            return y
        for k in range(min(len(x), len(y)), -1, -1):
            if x.endswith(y[:k]):
                return x + y[k:]
        return x + y

    from itertools import permutations
    best = None
    for p, q, r in permutations([a, b, c]):
        candidate = merge(merge(p, q), r)
        if best is None or len(candidate) < len(best) or (len(candidate) == len(best) and candidate < best):
            best = candidate
    return best
`
