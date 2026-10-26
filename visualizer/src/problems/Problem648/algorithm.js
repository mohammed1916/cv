export function parseInput(text) {
  const data = JSON.parse(text)
  const { dictionary, sentence } = data ?? {}
  if (!Array.isArray(dictionary) || dictionary.length < 1 || dictionary.length > 1000 || dictionary.some(w => typeof w !== 'string' || !/^[a-z]{1,100}$/.test(w))) throw new Error('dictionary must hold 1–1,000 lowercase roots.')
  if (typeof sentence !== 'string' || !/^[a-z]+( [a-z]+)*$/.test(sentence) || sentence.length > 4000) throw new Error('sentence must be lowercase words separated by single spaces.')
  return { dictionary, sentence }
}

// Each word takes the shortest dictionary root that is one of its prefixes.
export function buildTrace({ dictionary, sentence }) {
  const roots = new Set(dictionary)
  const words = sentence.split(' ')
  const out = []
  const frames = [{ phase: 'start', word: null, prefix: '', out: [], activeLine: 2, message: 'Load the roots into a set; each word looks for its shortest root prefix.' }]
  for (const word of words) {
    let replacement = word
    let prefix = ''
    let found = false
    for (let i = 1; i <= word.length; i++) {
      prefix = word.slice(0, i)
      if (roots.has(prefix)) { replacement = prefix; found = true; break }
    }
    out.push(replacement)
    frames.push({ phase: 'word', word, prefix: found ? prefix : word, found, out: [...out], activeLine: found ? 6 : 8,
      message: found ? `${word}: shortest root prefix ${prefix} replaces it.` : `${word}: no root is a prefix, so it stays.` })
  }
  const result = out.join(' ')
  frames.push({ phase: 'done', word: null, prefix: '', out: [...out], result, activeLine: 10, message: `Result: ${result}` })
  return { input: { dictionary, sentence }, result, frames }
}

export const code = `def replaceWords(dictionary, sentence):
    roots = set(dictionary)
    out = []
    for word in sentence.split():
        for i in range(1, len(word) + 1):
            if word[:i] in roots:
                word = word[:i]
                break
        out.append(word)
    return ' '.join(out)`.split('\n').map((text, index) => ({ line: index + 1, text }))
