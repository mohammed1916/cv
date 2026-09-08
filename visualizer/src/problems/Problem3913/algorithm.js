const VOWELS = 'aeiou'
export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !/^[a-z]+$/.test(s) || s.length > 100000) throw new Error('Enter a JSON string of 1–100,000 lowercase letters.')
  return s
}
export function buildTrace(s) {
  const counts = [0, 0, 0, 0, 0], first = [-1, -1, -1, -1, -1], positions = [], ordinal = new Int32Array(s.length).fill(-1)
  const frames = [{ phase: 'start', index: -1, placed: 0, counts: [...counts], activeLine: 2, message: 'Count vowels; consonant positions will remain fixed.' }]
  for (let i = 0; i < s.length; i++) {
    const v = VOWELS.indexOf(s[i])
    if (v >= 0) {
      if (!counts[v]) first[v] = i
      counts[v]++
      ordinal[i] = positions.length
      positions.push(i)
    }
    frames.push({ phase: 'count', index: i, placed: 0, counts: [...counts], activeLine: v >= 0 ? 6 : 4,
      message: v >= 0 ? `Count ${s[i]} at index ${i}: ${counts[v]} seen so far.` : `${s[i]} is a consonant; keep index ${i} fixed.` })
  }
  const order = [...VOWELS].filter(v => counts[VOWELS.indexOf(v)] > 0)
    .sort((a, b) => counts[VOWELS.indexOf(b)] - counts[VOWELS.indexOf(a)] || first[VOWELS.indexOf(a)] - first[VOWELS.indexOf(b)])
  const sorted = order.map(v => v.repeat(counts[VOWELS.indexOf(v)])).join('')
  frames.push({ phase: 'rank', index: -1, placed: 0, counts, activeLine: 7, message: 'Rank by descending frequency; ties use first occurrence, not alphabetic order.' })
  const result = [...s]
  positions.forEach((index, rank) => {
    result[index] = sorted[rank]
    frames.push({ phase: 'write', index, placed: rank + 1, counts, activeLine: 10, message: `Place ${sorted[rank]} in vowel slot ${index}. Consonants do not move.` })
  })
  frames.push({ phase: 'done', index: -1, placed: positions.length, counts, activeLine: 11, message: 'All vowel slots are filled in ranked order.' })
  return { input: s, result: result.join(''), positions, ordinal, counts, first, order, frames }
}
export const code = `def sortVowels(s):
    counts, first = {}, {}
    for i, ch in enumerate(s):
        if ch in "aeiou":
            first.setdefault(ch, i)
            counts[ch] = counts.get(ch, 0) + 1
    order = sorted(counts, key=lambda ch: (-counts[ch], first[ch]))
    vowels = iter("".join(ch * counts[ch] for ch in order))
    result = [ch for ch in s]
    result = [next(vowels) if ch in counts else ch for ch in result]
    return "".join(result)`.split('\n').map((text, index) => ({ line: index + 1, text }))
