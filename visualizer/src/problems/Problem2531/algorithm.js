export function parseInput(text) {
  const data = JSON.parse(text)
  const ok = w => typeof w === 'string' && w.length >= 1 && w.length <= 20 && /^[a-z]+$/.test(w)
  if (!data || !ok(data.word1) || !ok(data.word2)) throw new Error('Use word1 and word2, each 1 to 20 lowercase letters.')
  return { word1: data.word1, word2: data.word2 }
}

const countLetters = word => {
  const counts = new Map()
  for (const ch of word) counts.set(ch, (counts.get(ch) || 0) + 1)
  return counts
}

export function buildTrace({ word1, word2 }) {
  const c1 = countLetters(word1), c2 = countLetters(word2)
  const d1 = c1.size, d2 = c2.size
  const base = { c1: [...c1], c2: [...c2], d1, d2 }
  const frames = [{ phase: 'count', activeLine: L('count the letters of word1'), ...base, pair: null, n1: d1, n2: d2, message: `word1 has ${d1} distinct letter(s) and word2 has ${d2}.` }]
  for (const a of c1.keys()) {
    for (const b of c2.keys()) {
      if (a === b) {
        frames.push({ phase: 'try', activeLine: L('if a and b are the same'), ...base, pair: [a, b], n1: d1, n2: d2, message: `Swapping ${a} with ${b} changes nothing, so the counts stay ${d1} and ${d2}.` })
        if (d1 === d2) {
          frames.push({ phase: 'found', activeLine: L('return true if d1'), ...base, pair: [a, b], n1: d1, n2: d2, result: true, message: 'The counts already match, so one swap keeps them equal.' })
          return { input: { word1, word2 }, result: true, frames }
        }
        continue
      }
      const n1 = d1 - (c1.get(a) === 1 ? 1 : 0) + (c1.has(b) ? 0 : 1)
      const n2 = d2 - (c2.get(b) === 1 ? 1 : 0) + (c2.has(a) ? 0 : 1)
      frames.push({ phase: 'try', activeLine: L('work out the new distinct'), ...base, pair: [a, b], n1, n2, message: `Swap ${a} from word1 with ${b} from word2: counts become ${n1} and ${n2}.` })
      if (n1 === n2) {
        frames.push({ phase: 'found', activeLine: L('if the new counts are equal'), ...base, pair: [a, b], n1, n2, result: true, message: `Counts ${n1} and ${n2} match, so the answer is true.` })
        return { input: { word1, word2 }, result: true, frames }
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return false'), ...base, pair: null, n1: d1, n2: d2, result: false, message: 'No single swap makes the distinct counts equal.' })
  return { input: { word1, word2 }, result: false, frames }
}

export const code = `can one swap make the distinct letter counts equal
  count the letters of word1 and word2
  set d1 to the distinct letters of word1 and d2 to those of word2
  for each letter a in word1 and each letter b in word2
    if a and b are the same letter then
      return true if d1 equals d2
    otherwise work out the new distinct counts after the swap
    if the new counts are equal then
      return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_make_distinct_equal(word1, word2):
    c1 = {}
    for ch in word1:
        c1[ch] = c1.get(ch, 0) + 1
    c2 = {}
    for ch in word2:
        c2[ch] = c2.get(ch, 0) + 1
    d1, d2 = len(c1), len(c2)
    for a in c1:
        for b in c2:
            if a == b:
                if d1 == d2:
                    return True
                continue
            n1 = d1 - (1 if c1[a] == 1 else 0) + (0 if b in c1 else 1)
            n2 = d2 - (1 if c2[b] == 1 else 0) + (0 if a in c2 else 1)
            if n1 == n2:
                return True
    return False
`
