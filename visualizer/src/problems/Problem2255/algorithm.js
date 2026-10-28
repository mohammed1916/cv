export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).sort().join() !== 's,words') throw new Error('Use an object with exactly the keys "words" and "s".')
  const { words, s } = value
  if (!Array.isArray(words) || words.length < 1 || words.length > 10) throw new Error('Use 1 to 10 words.')
  if (words.some(w => typeof w !== 'string' || !/^[a-z]{1,10}$/.test(w))) throw new Error('Each word is 1 to 10 lowercase letters.')
  if (typeof s !== 'string' || !/^[a-z]{1,20}$/.test(s)) throw new Error('s is 1 to 20 lowercase letters.')
  return { words, s }
}

export function buildTrace({ words, s }) {
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), active: -1, roles: {}, state: { s, count: 0 }, message: `Count the words that are a prefix of "${s}".` }]
  let count = 0
  words.forEach((word, i) => {
    const isPrefix = s.startsWith(word)
    if (isPrefix) count += 1
    frames.push({ phase: 'check', activeLine: L(isPrefix ? 'add 1 to count' : 'if s starts with word'), active: i, roles: { [i]: isPrefix ? 'prefix' : 'not prefix' }, state: { word, count }, message: `"${word}" ${isPrefix ? 'is' : 'is not'} a prefix of "${s}". Count is ${count}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return count'), active: -1, roles: {}, state: { count }, message: `Return ${count}.` })
  return { input: { words, s }, result: count, items: words, frames }
}

export const code = `count the words that are prefixes of s
  set count to 0
  for each word in words
    if s starts with word then
      add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_prefixes(words, s):
    count = 0
    for word in words:
        if s.startswith(word):
            count += 1
    return count
`
