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
  for each start i where a occurs in s
  check every start j where b occurs in s
  if the distance between i and j is at most k then add i to beautiful and stop checking j
  return beautiful`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ s, a, b, k }) {
  const result = []
  const frames = [{ phase: 'start', activeLine: L('let beautiful'), index: -1, found: [], message: `Look for "${a}" with a "${b}" within ${k} positions.` }]
  for (let i = 0; i + a.length <= s.length; i++) {
    if (s.slice(i, i + a.length) !== a) continue
    let ok = false
    for (let j = 0; j + b.length <= s.length && !ok; j++) {
      if (s.slice(j, j + b.length) !== b) continue
      if (Math.abs(i - j) <= k) {
        ok = true
        frames.push({ phase: 'match', activeLine: L('if the distance between'), index: i, found: [...result, i], message: `"${a}" at ${i} and "${b}" at ${j} are ${Math.abs(i - j)} apart.` })
      }
    }
    if (ok) result.push(i)
    else frames.push({ phase: 'miss', activeLine: L('check every start'), index: i, found: [...result], message: `No "${b}" within ${k} of ${i}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return beautiful'), index: -1, found: [...result], message: `Beautiful indices: [${result.join(', ')}].` })
  return { input: { s, a, b, k }, result, frames }
}

export const python = `def beautiful_indices(s, a, b, k):
    result = []
    for i in range(len(s) - len(a) + 1):
        if s[i:i + len(a)] != a:
            continue
        for j in range(len(s) - len(b) + 1):
            if s[j:j + len(b)] == b and abs(i - j) <= k:
                result.append(i)
                break
    return result
`
