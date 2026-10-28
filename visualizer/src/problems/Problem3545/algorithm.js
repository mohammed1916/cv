export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data.s !== 'string' || data.s.length < 1 || data.s.length > 30 || !/^[a-z]+$/.test(data.s)) throw new Error('Use a string s of 1 to 30 lowercase letters.')
  if (!Number.isInteger(data.k) || data.k < 0 || data.k > 26) throw new Error('Use an integer k from 0 to 26.')
  return { s: data.s, k: data.k }
}

export function buildTrace({ s, k }) {
  const counts = new Map()
  const frames = [{ phase: 'start', activeLine: L('count how many times'), index: -1, counts: [], message: `Count the letters in "${s}", then keep at most ${k} distinct letters.` }]
  for (let i = 0; i < s.length; i++) {
    counts.set(s[i], (counts.get(s[i]) || 0) + 1)
    frames.push({ phase: 'count', activeLine: L('count how many times'), index: i, counts: [...counts], message: `Letter ${s[i]} has now appeared ${counts.get(s[i])} time(s).` })
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
  frames.push({ phase: 'rank', activeLine: L('sort the letter counts'), index: -1, counts: ranked, message: 'Sort the letters from most frequent to least frequent.' })
  const kept = ranked.slice(0, k)
  const keptTotal = kept.reduce((sum, [, count]) => sum + count, 0)
  frames.push({ phase: 'keep', activeLine: L('keep the first k counts'), index: -1, counts: ranked, kept: kept.map(([letter]) => letter), message: `Keep ${kept.length} letter(s): ${kept.map(([letter]) => letter).join(', ') || 'none'}, covering ${keptTotal} characters.` })
  const result = s.length - keptTotal
  frames.push({ phase: 'done', activeLine: L('return the deletions'), index: -1, counts: ranked, kept: kept.map(([letter]) => letter), message: `Delete the other ${result} character(s).` })
  return { input: { s, k }, result, frames }
}

export const code = `minimum deletions to keep at most k distinct letters
  count how many times each letter appears in s
  sort the letter counts from largest to smallest
  keep the first k counts, which are the most frequent letters
  the deletions are the length of s minus the kept total
  return the deletions`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_deletions_at_most_k(s, k):
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    ranked = sorted(counts.values(), reverse=True)
    kept_total = sum(ranked[:k])
    return len(s) - kept_total
`
