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
  const frames = [{ phase: 'start', index: -1, counts: [], bestWord: null, activeLine: 3, message: `Lowercase the paragraph and split it into ${words.length} letter-only words. ${banned.length} word(s) are banned.` }]
  words.forEach((word, index) => {
    if (ban.has(word)) {
      frames.push({ phase: 'skip', index, word, counts: snap(), bestWord, activeLine: 7, message: `"${word}" is banned, so it is skipped.` })
      return
    }
    counts.set(word, (counts.get(word) || 0) + 1)
    if (bestWord === null || counts.get(word) > counts.get(bestWord)) bestWord = word
    frames.push({ phase: 'count', index, word, counts: snap(), bestWord, activeLine: 8, message: `Count "${word}": now ${counts.get(word)}. Most common so far: "${bestWord}" (${counts.get(bestWord)}).` })
  })
  frames.push({ phase: 'done', index: words.length - 1, counts: snap(), bestWord, activeLine: 9, message: `The most common non-banned word is "${bestWord}" with ${counts.get(bestWord)} occurrence(s).` })
  return { input: { paragraph, banned }, words, result: bestWord, frames }
}
export const code = `import re
def mostCommonWord(paragraph, banned):
    ban = set(banned)
    count = {}
    for word in re.findall(r'[a-z]+', paragraph.lower()):
        if word in ban:
            continue
        count[word] = count.get(word, 0) + 1
    return max(count, key=count.get)`.split('\n').map((text, index) => ({ line: index + 1, text }))
