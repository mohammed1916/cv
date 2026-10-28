export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 16) throw new Error('Use a JSON string of 1 to 16 characters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use lowercase letters a to z only.')
  return s
}

// A piece is balanced when every letter it contains appears the same number of times.
function isBalanced(piece) {
  const counts = new Map()
  for (const ch of piece) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  return new Set(counts.values()).size === 1
}

export function buildTrace(s) {
  const n = s.length
  const best = [0]
  const from = [-1]
  const frames = [{ phase: 'start', activeLine: L('best[0] = 0'), end: 0, piece: null, best: 0, message: 'The empty prefix needs no pieces.' }]
  for (let i = 1; i <= n; i++) {
    best[i] = Infinity
    from[i] = -1
    for (let j = i - 1; j >= 0; j--) {
      if (!isBalanced(s.slice(j, i))) continue
      if (best[j] + 1 < best[i]) {
        best[i] = best[j] + 1
        from[i] = j
      }
    }
    const piece = from[i] >= 0 ? s.slice(from[i], i) : ''
    frames.push({ phase: 'end', activeLine: L('best[i] = smaller'), end: i, piece: from[i] >= 0 ? [from[i], i] : null, best: best[i], message: `Prefix of length ${i} needs ${best[i]} piece${best[i] === 1 ? '' : 's'}; the last piece is "${piece}".` })
  }
  frames.push({ phase: 'done', activeLine: L('return best[n]'), end: n, piece: null, best: best[n], message: `Minimum number of balanced pieces: ${best[n]}.` })
  return { input: s, result: best[n], frames }
}

export const code = `fewest balanced pieces in a partition of s
  n = length of s
  best[0] = 0
  for each end position i from 1 to n
    best[i] = infinity
    for each start position j from i - 1 down to 0
      if the piece s[j..i) is balanced then
        best[i] = smaller of best[i] and best[j] + 1
  return best[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def minimum_balanced_partition(s):
    n = len(s)
    best = [0] + [float('inf')] * n
    for i in range(1, n + 1):
        for j in range(i - 1, -1, -1):
            counts = Counter(s[j:i])
            if len(set(counts.values())) == 1:
                best[i] = min(best[i], best[j] + 1)
    return best[n]
`
