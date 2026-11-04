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
  const frames = [{ phase: 'start', activeLine: L('let best = null'), pythonLine: 13, order: '', candidate: '', best: '', message: 'Try each order of the three strings.' }]
  for (const [p, q, r] of orders) {
    const first = merge(strings[p], strings[q])
    const candidate = merge(first, strings[r])
    const label = `${strings[p]}, ${strings[q]}, ${strings[r]}`
    if (best === null || candidate.length < best.length || (candidate.length === best.length && candidate < best)) {
      best = candidate
      frames.push({ phase: 'better', activeLine: L('best = candidate'), pythonLine: 17, order: label, candidate, best, message: `Order ${label} gives ${candidate}, which is the best so far.` })
    } else {
      frames.push({ phase: 'try', activeLine: L('const candidate'), pythonLine: 16, order: label, candidate, best, message: `Order ${label} gives ${candidate}, which is not better than ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: 18, order: '', candidate: '', best, message: `Shortest string: ${best}.` })
  return { input: { a, b, c }, result: best, frames }
}

export const code = `function shortestStringWithThree(a, b, c) {
  const merge = (x, y) => {
    if (x.includes(y)) return x
    if (y.includes(x)) return y
    for (let k = Math.min(x.length, y.length); k >= 0; k--) {
      if (x.endsWith(y.slice(0, k))) return x + y.slice(k)
    }
    return x + y
  }
  let best = null
  for (const [p, q, r] of permutations([a, b, c])) {
    const candidate = merge(merge(p, q), r)
    if (best === null || candidate.length < best.length || (candidate.length === best.length && candidate < best)) {
      best = candidate
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
