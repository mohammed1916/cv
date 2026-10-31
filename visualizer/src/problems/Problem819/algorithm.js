export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.paragraph !== 'string' || !Array.isArray(data.banned)) throw new Error('Enter JSON like {"paragraph": "...", "banned": ["word"]}.')
  if (!data.paragraph.length || data.paragraph.length > 500) throw new Error('paragraph must have 1-500 characters (visualization cap).')
  if (data.banned.length > 20 || data.banned.some(w => typeof w !== 'string' || !/^[a-z]{1,10}$/.test(w))) throw new Error('banned must hold at most 20 lowercase words of 1-10 letters.')
  const words = data.paragraph.toLowerCase().match(/[a-z]+/g) || []
  if (!words.some(w => !data.banned.includes(w))) throw new Error('The paragraph needs at least one word that is not banned.')
  return { paragraph: data.paragraph, banned: [...data.banned] }
}
export function buildTrace({ paragraph, banned }) {
  const words = paragraph.toLowerCase().match(/[a-z]+/g) || []
  const ban = new Set(banned)
  const counts = new Map()
  let bestWord = null
  const snap = () => [...counts.entries()]
  const frames = [{ phase: 'start', index: -1, counts: [], bestWord: null, activeLine: L('set ban to'), message: `Lowercase the paragraph and split it into ${words.length} letter-only words. ${banned.length} word(s) are banned.`, pythonLine: 4 }]
  words.forEach((word, index) => {
    if (ban.has(word)) {
      frames.push({ phase: 'skip', index, word, counts: snap(), bestWord, activeLine: L('if word is in ban'), message: `"${word}" is banned, so it is skipped.`, pythonLine: 8 })
      return
    }
    counts.set(word, (counts.get(word) || 0) + 1)
    // Leader = the earliest-inserted word with the largest count, so ties match the final max(count) answer.
    bestWord = [...counts.keys()].reduce((best, w) => (best === null || counts.get(w) > counts.get(best) ? w : best), null)
    frames.push({ phase: 'count', index, word, counts: snap(), bestWord, activeLine: L('set best to the earliest'), message: `Count "${word}": now ${counts.get(word)}. Most common so far: "${bestWord}" (${counts.get(bestWord)}).`, pythonLine: 9 })
  })
  frames.push({ phase: 'done', index: words.length - 1, counts: snap(), bestWord, activeLine: L('return best'), message: `The most common non-banned word is "${bestWord}" with ${counts.get(bestWord)} occurrence(s).`, pythonLine: 10 })
  return { input: { paragraph, banned }, words, result: bestWord, frames }
}
export const code = `set ban to the set of banned words
set count to an empty map from word to frequency
for each word in the lowercased runs of letters in paragraph
  if word is in ban, skip it
  add 1 to count[word]
  set best to the earliest-inserted word with the largest count
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import re

def most_common_word(paragraph, banned):
    ban = set(banned)
    count = {}
    for word in re.findall(r'[a-z]+', paragraph.lower()):
        if word in ban:
            continue
        count[word] = count.get(word, 0) + 1
    return max(count, key=count.get)
`
