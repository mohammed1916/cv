export function parseInput(text) {
  const word = JSON.parse(text)
  if (typeof word !== 'string' || word.length < 1 || word.length > 30) throw new Error('Use a JSON string of 1 to 30 characters.')
  if (!/^[a-z]+$/.test(word)) throw new Error('Use only lowercase letters a to z.')
  return word
}

export function buildTrace(word) {
  const counts = new Map()
  for (const ch of word) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  const ranked = [...counts].map(([letter, freq]) => ({ letter, freq })).sort((a, b) => b.freq - a.freq || a.letter.localeCompare(b.letter))
  let total = 0
  const frames = [{ phase: 'count', activeLine: L('count how often'), rank: -1, ranked: [], total: 0, message: `Count the letters of "${word}".` }]
  frames.push({ phase: 'sort', activeLine: L('sort the counts'), rank: -1, ranked, total: 0, message: `Letters by frequency: ${ranked.map(r => `${r.letter}:${r.freq}`).join(' ')}.` })
  ranked.forEach((entry, rank) => {
    const presses = Math.floor(rank / 8) + 1
    total += entry.freq * presses
    frames.push({ phase: 'assign', activeLine: L('add count times presses'), rank, ranked, total, message: `${entry.letter} (${entry.freq} times) uses ${presses} press${presses === 1 ? '' : 'es'} per letter. Total is ${total}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return total'), rank: ranked.length, ranked, total, message: `Minimum pushes: ${total}.` })
  return { input: word, result: total, frames }
}

export const code = `minimum pushes to type the word:
  count how often each letter appears
  sort the counts from largest to smallest
  for each count at rank r, starting at 0, do
    the letter takes r divided by 8, plus 1, presses on its key
    add count times presses to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def minimum_pushes(word):
    ranked = sorted(Counter(word).values(), reverse=True)
    total = 0
    for rank, freq in enumerate(ranked):
        presses = rank // 8 + 1
        total += freq * presses
    return total
`
