export function parseInput(text) {
  const data = JSON.parse(text)
  const s = data?.s
  const k = data?.k
  if (typeof s !== 'string' || !/^[a-z]{1,8}$/.test(s)) throw new Error('s must be 1 to 8 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > 26) throw new Error('k must be an integer from 1 to 26.')
  return { s, k }
}

export const code = `maximum partitions after at most one change(s, k)
  best = partitions(s, k)
  for each position p in s
    for each letter c from a to z, other than the letter at p
      candidate = s with position p replaced by c
      best = max(best, partitions(candidate, k))
  return best
partitions(t, k)
  count = 0, seen = empty set
  for each character ch in t
    if ch is not in seen and seen has k letters then count += 1 and clear seen
    add ch to seen
  return count + 1 if seen is non-empty, otherwise count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Each partition is the longest prefix with at most k distinct letters; trying each single change finds the best string.
function partitions(t, k) {
  let count = 0
  let seen = new Set()
  for (const ch of t) {
    if (!seen.has(ch) && seen.size === k) {
      count += 1
      seen = new Set()
    }
    seen.add(ch)
  }
  return seen.size > 0 ? count + 1 : count
}

export function buildTrace({ s, k }) {
  let best = partitions(s, k)
  const frames = [{ phase: 'start', position: -1, letter: '', candidate: s, count: best, best, activeLine: L('best = partitions(s, k)'), message: `Without a change, ${s} splits into ${best} partitions.` }]
  for (let p = 0; p < s.length; p++) {
    for (const c of 'abcdefghijklmnopqrstuvwxyz') {
      if (c === s[p]) continue
      const candidate = s.slice(0, p) + c + s.slice(p + 1)
      const count = partitions(candidate, k)
      best = Math.max(best, count)
      frames.push({ phase: 'try', position: p, letter: c, candidate, count, best, activeLine: L('candidate = s with'), message: `Changing position ${p} to ${c} gives ${count} partitions; best so far ${best}.` })
    }
  }
  frames.push({ phase: 'done', position: -1, letter: '', candidate: s, count: best, best, activeLine: L('return best'), message: `Most partitions: ${best}.` })
  return { input: { s, k }, result: best, frames }
}

export const python = `def max_partitions(s, k):
    def partitions(t):
        count = 0
        seen = set()
        for ch in t:
            if ch not in seen and len(seen) == k:
                count += 1
                seen = set()
            seen.add(ch)
        return count + 1 if seen else count

    best = partitions(s)
    for p in range(len(s)):
        for c in 'abcdefghijklmnopqrstuvwxyz':
            if c != s[p]:
                best = max(best, partitions(s[:p] + c + s[p + 1:]))
    return best
`
