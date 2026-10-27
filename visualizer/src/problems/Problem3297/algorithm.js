export function parseInput(text) {
  const input = JSON.parse(text)
  if (typeof input?.word1 !== 'string' || input.word1.length < 1 || input.word1.length > 12 || !/^[a-z]+$/.test(input.word1)) throw new Error('Give word1 as 1 to 12 lowercase letters.')
  if (typeof input?.word2 !== 'string' || input.word2.length < 1 || input.word2.length > 5 || !/^[a-z]+$/.test(input.word2)) throw new Error('Give word2 as 1 to 5 lowercase letters.')
  return { word1: input.word1, word2: input.word2 }
}

export function buildTrace({ word1, word2 }) {
  const n = word1.length
  const need = new Map()
  for (const c of word2) need.set(c, (need.get(c) ?? 0) + 1)
  const covers = have => [...need].every(([c, amount]) => (have.get(c) ?? 0) >= amount)
  const frames = [{ phase: 'start', activeLine: L('set total to zero'), start: 0, end: -1, have: '', total: 0, message: `A substring works when it holds every letter of ${word2} at least as often as ${word2} does.` }]
  let total = 0
  for (let start = 0; start < n; start++) {
    const have = new Map()
    for (let end = start; end < n; end++) {
      have.set(word1[end], (have.get(word1[end]) ?? 0) + 1)
      const ok = covers(have)
      frames.push({ phase: 'extend', activeLine: L('add the letter at j'), start, end, have: [...have].map(([c, k]) => `${c}${k}`).join(' '), total, message: `Add ${word1[end]}. Substring ${start} to ${end} ${ok ? 'covers' : 'does not yet cover'} ${word2}.` })
      if (ok) {
        total += n - end
        frames.push({ phase: 'count', activeLine: L('cover every letter'), start, end, have: [...have].map(([c, k]) => `${c}${k}`).join(' '), total, message: `Ends ${end} to ${n - 1} all work for start ${start}. Total ${total}.` })
        break
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), start: 0, end: n - 1, have: '', total, message: `There are ${total} qualifying substrings.` })
  return { input: { word1, word2 }, result: total, frames }
}

export const code = `count substrings that can be rearranged to start with word2 (word1, word2)
  set total to zero
  for each start index i
    set counts to an empty map
    for each end index j from i
      add the letter at j to counts
      if counts cover every letter of word2 then add word1 length minus j to total and stop this start
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_rearrangeable_substrings(word1, word2):
    need = {}
    for ch in word2:
        need[ch] = need.get(ch, 0) + 1
    n = len(word1)
    total = 0
    for start in range(n):
        have = {}
        for end in range(start, n):
            have[word1[end]] = have.get(word1[end], 0) + 1
            if all(have.get(ch, 0) >= amount for ch, amount in need.items()):
                total += n - end
                break
    return total
`
