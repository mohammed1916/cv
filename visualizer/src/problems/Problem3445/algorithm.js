export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input.s !== 'string' || !Number.isInteger(input.k)) {
    throw new Error('Use an object such as {"s": "1122211", "k": 3}.')
  }
  const { s, k } = input
  if (s.length < 3 || s.length > 16) throw new Error('s needs 3 to 16 digits for the visualization.')
  if (!/^[0-4]+$/.test(s)) throw new Error('s uses the digits 0 to 4 only.')
  if (k < 1 || k > s.length) throw new Error('k is an integer from 1 to the length of s.')
  if (!Number.isFinite(bestDifference(s, k, () => {}))) throw new Error('No substring of length at least k has an odd count and an even nonzero count.')
  return { s, k }
}

// For a pair (a, b), the value of a substring from prefix l to prefix r is
// (count_a(r) - count_b(r)) - (count_a(l) - count_b(l)). We need count_a odd (parities differ),
// count_b even (parities match) and count_b nonzero, which holds when l is before the last b.
export function bestDifference(s, k, onPair) {
  const n = s.length
  let best = -Infinity
  for (let a = 0; a <= 4; a++) {
    for (let b = 0; b <= 4; b++) {
      if (a === b) continue
      const countA = [0]
      const countB = [0]
      for (let i = 0; i < n; i++) {
        countA.push(countA[i] + (s[i] === String(a) ? 1 : 0))
        countB.push(countB[i] + (s[i] === String(b) ? 1 : 0))
      }
      const table = [Infinity, Infinity, Infinity, Infinity]
      let lastB = 0
      let next = 0
      for (let r = 1; r <= n; r++) {
        if (s[r - 1] === String(b)) lastB = r
        if (r < k) continue
        const limit = Math.min(r - k, lastB - 1)
        while (next <= limit) {
          const key = ((countA[next] & 1) << 1) | (countB[next] & 1)
          table[key] = Math.min(table[key], countA[next] - countB[next])
          next += 1
        }
        const key = (((countA[r] & 1) ^ 1) << 1) | (countB[r] & 1)
        if (table[key] !== Infinity) best = Math.max(best, countA[r] - countB[r] - table[key])
      }
      onPair(a, b, best)
    }
  }
  return best
}

export function buildTrace({ s, k }) {
  const input = { s, k }
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), pair: '-', best: null, message: 'Try each ordered pair of digits as the odd digit a and the even digit b.' }]
  const result = bestDifference(s, k, (a, b, best) => {
    frames.push({ phase: 'pair', activeLine: L('for each ordered pair'), pair: `${a}-${b}`, best: Number.isFinite(best) ? best : null, message: `Pair a=${a}, b=${b}: best difference so far ${Number.isFinite(best) ? best : 'none'}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), pair: '-', best: result, message: `Maximum difference: ${result}.` })
  return { input, result, frames }
}

export const code = `maximum of count of a minus count of b over substrings of length at least k
  set best to nothing
  for each ordered pair of different digits a and b
    keep, for each parity of count a and count b, the smallest prefix value seen
    move the right end across the string
    add every left end that is at least k back and before the last b
    if a substring with a odd and b even can end here then update best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_odd_even_difference(s, k):
    n = len(s)
    best = None
    for a in range(5):
        for b in range(5):
            if a == b:
                continue
            count_a = [0]
            count_b = [0]
            for ch in s:
                count_a.append(count_a[-1] + (ch == str(a)))
                count_b.append(count_b[-1] + (ch == str(b)))
            table = [None, None, None, None]
            last_b = 0
            nxt = 0
            for r in range(1, n + 1):
                if s[r - 1] == str(b):
                    last_b = r
                if r < k:
                    continue
                limit = min(r - k, last_b - 1)
                while nxt <= limit:
                    key = ((count_a[nxt] & 1) << 1) | (count_b[nxt] & 1)
                    value = count_a[nxt] - count_b[nxt]
                    if table[key] is None or value < table[key]:
                        table[key] = value
                    nxt += 1
                key = (((count_a[r] & 1) ^ 1) << 1) | (count_b[r] & 1)
                if table[key] is not None:
                    candidate = count_a[r] - count_b[r] - table[key]
                    if best is None or candidate > best:
                        best = candidate
    return best
`
