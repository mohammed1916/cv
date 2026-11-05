export function parseInput(text) {
  const data = JSON.parse(text)
  const words = data?.words
  if (!Array.isArray(words) || words.length < 1 || words.length > 8) throw new Error('words must be a list of 1 to 8 strings.')
  if (words.some(w => typeof w !== 'string' || !/^[a-z]{1,6}$/.test(w))) throw new Error('Each word is 1 to 6 lowercase letters.')
  return { words }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function longestStrChain(words) {', 'def longest_str_chain(words):'],
  ['  const unique = [...new Set(words)].sort((a, b) => a.length - b.length)', '    unique = sorted(set(words), key=len)'],
  ['  const best = new Map()', '    best = {}'],
  ['  for (const word of unique) {', '    for word in unique:'],
  ['    best.set(word, 1)', '        best[word] = 1'],
  ['    for (let i = 0; i < word.length; i++) {', '        for i in range(len(word)):'],
  ['      const shorter = word.slice(0, i) + word.slice(i + 1)', '            shorter = word[:i] + word[i + 1:]'],
  ['      if (best.has(shorter)) best.set(word, Math.max(best.get(word), best.get(shorter) + 1))', '            if shorter in best: best[word] = max(best[word], best[shorter] + 1)'],
  ['    }', ''],
  ['  }', ''],
  ['  return Math.max(0, ...best.values())', '    return max(best.values(), default=0)'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

// A predecessor is one letter shorter, so sorting by length guarantees its chain length is already known.
export function buildTrace({ words }) {
  const unique = [...new Set(words)].sort((a, b) => a.length - b.length)
  const best = new Map()
  const snapshot = () => Object.fromEntries(best)
  const frames = [{ phase: 'start', pythonLine: P('unique = sorted'), word: null, shorter: null, best: snapshot(), activeLine: L('const unique = '), message: 'Sort the unique words by length so that every shorter word is handled first.' }]
  for (const word of unique) {
    best.set(word, 1)
    frames.push({ phase: 'word', pythonLine: P('best[word] = 1'), word, shorter: null, best: snapshot(), activeLine: L('best.set(word, 1)'), message: `${word} starts a chain of length 1.` })
    for (let i = 0; i < word.length; i++) {
      const shorter = word.slice(0, i) + word.slice(i + 1)
      if (!best.has(shorter)) continue
      best.set(word, Math.max(best.get(word), best.get(shorter) + 1))
      frames.push({ phase: 'predecessor', pythonLine: P('if shorter in best'), word, shorter, best: snapshot(), activeLine: L('if (best.has(shorter))'), message: `${shorter} is a predecessor of ${word}; the chain ending at ${word} is now ${best.get(word)}.` })
    }
  }
  const result = Math.max(0, ...best.values())
  frames.push({ phase: 'done', pythonLine: P('return max(best.values()'), word: null, shorter: null, best: snapshot(), activeLine: L('return Math.max'), message: `Longest chain: ${result}.` })
  return { input: { words }, result, frames }
}
