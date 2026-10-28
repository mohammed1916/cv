export function parseInput(text) {
  const data = JSON.parse(text)
  const words = data?.words
  if (!Array.isArray(words) || words.length < 1 || words.length > 8) throw new Error('words must be a list of 1 to 8 strings.')
  if (words.some(w => typeof w !== 'string' || !/^[a-z]{1,6}$/.test(w))) throw new Error('Each word is 1 to 6 lowercase letters.')
  return { words }
}

export const code = `longest string chain(words)
  make a set of the unique words, sorted by length from shortest to longest
  best = empty map from word to chain length
  for each word w in that order
    best[w] = 1
    for each position i in w
      shorter = w with the letter at position i removed
      if shorter is in best then best[w] = max(best[w], best[shorter] + 1)
  return the largest value in best, or 0 when there are no words`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// A predecessor is one letter shorter, so sorting by length guarantees its chain length is already known.
export function buildTrace({ words }) {
  const unique = [...new Set(words)].sort((a, b) => a.length - b.length)
  const best = new Map()
  const snapshot = () => Object.fromEntries(best)
  const frames = [{ phase: 'start', word: null, shorter: null, best: snapshot(), activeLine: L('best = empty map'), message: 'Sort the unique words by length so that every shorter word is handled first.' }]
  for (const word of unique) {
    best.set(word, 1)
    frames.push({ phase: 'word', word, shorter: null, best: snapshot(), activeLine: L('best[w] = 1'), message: `${word} starts a chain of length 1.` })
    for (let i = 0; i < word.length; i++) {
      const shorter = word.slice(0, i) + word.slice(i + 1)
      if (!best.has(shorter)) continue
      best.set(word, Math.max(best.get(word), best.get(shorter) + 1))
      frames.push({ phase: 'predecessor', word, shorter, best: snapshot(), activeLine: L('if shorter is in best'), message: `${shorter} is a predecessor of ${word}; the chain ending at ${word} is now ${best.get(word)}.` })
    }
  }
  const result = Math.max(0, ...best.values())
  frames.push({ phase: 'done', word: null, shorter: null, best: snapshot(), activeLine: L('return the largest value'), message: `Longest chain: ${result}.` })
  return { input: { words }, result, frames }
}

export const python = `def longest_str_chain(words):
    best = {}
    for word in sorted(set(words), key=len):
        best[word] = 1
        for i in range(len(word)):
            shorter = word[:i] + word[i + 1:]
            if shorter in best:
                best[word] = max(best[word], best[shorter] + 1)
    return max(best.values(), default=0)
`
