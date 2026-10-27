export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s, a, b and k.')
  const { s, a, b, k } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 40 || !/^[a-z]+$/.test(s)) throw new Error('s must be 1 to 40 lowercase letters.')
  for (const [name, p] of [['a', a], ['b', b]]) {
    if (typeof p !== 'string' || p.length < 1 || p.length > (name === 'a' ? 3 : 8) || !/^[a-z]+$/.test(p)) throw new Error(`${name} must be 1 to 3 (a) or 1 to 8 (b) lowercase letters.`)
  }
  if (!Number.isInteger(k) || k < 0 || k > 20) throw new Error('k must be an integer from 0 to 20.')
  return { s, a, b, k }
}

export const code = `indices i where a occurs and a matching b occurs within distance k
  let beautiful be an empty list
  list the sorted starts of a in s as A and of b as B
  let p be zero, the first start of B still to consider
  for each start i in A
  move p forward while B at p is before i minus k
  if B at p is at most i plus k then add i to beautiful
  return beautiful`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const starts = (s, p) => {
  const out = []
  for (let i = 0; i + p.length <= s.length; i++) if (s.slice(i, i + p.length) === p) out.push(i)
  return out
}

export function buildTrace({ s, a, b, k }) {
  const A = starts(s, a)
  const B = starts(s, b)
  const result = []
  const frames = [{ phase: 'start', activeLine: L('list the sorted starts'), index: -1, found: [], p: 0, message: `Occurrences of "${a}": [${A.join(', ')}]; of "${b}": [${B.join(', ')}].` }]
  let p = 0
  for (const i of A) {
    while (p < B.length && B[p] < i - k) {
      p++
      frames.push({ phase: 'advance', activeLine: L('move p forward'), index: i, found: [...result], p, message: `The b start is too far left of ${i}; move on.` })
    }
    if (p < B.length && B[p] <= i + k) {
      result.push(i)
      frames.push({ phase: 'match', activeLine: L('if B at p is at most'), index: i, found: [...result], p, message: `"${b}" at ${B[p]} is within ${k} of ${i}.` })
    } else {
      frames.push({ phase: 'miss', activeLine: L('if B at p is at most'), index: i, found: [...result], p, message: `No "${b}" within ${k} of ${i}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return beautiful'), index: -1, found: [...result], p, message: `Beautiful indices: [${result.join(', ')}].` })
  return { input: { s, a, b, k }, result, frames }
}

export const python = `def beautiful_indices(s, a, b, k):
    def starts(p):
        return [i for i in range(len(s) - len(p) + 1) if s[i:i + len(p)] == p]

    A = starts(a)
    B = starts(b)
    result = []
    p = 0
    for i in A:
        while p < len(B) and B[p] < i - k:
            p += 1
        if p < len(B) and B[p] <= i + k:
            result.append(i)
    return result
`
