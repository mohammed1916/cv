export function parseInput(text) {
  const words = JSON.parse(text)
  if (!Array.isArray(words) || words.length < 1 || words.length > 12) throw new Error('Use an array of 1 to 12 words.')
  if (words.some(w => typeof w !== 'string' || !/^[a-z]{2}$/.test(w))) throw new Error('Each word is exactly two lowercase letters.')
  if (new Set(words).size !== words.length) throw new Error('Words must be distinct.')
  return words
}

export function buildTrace(words) {
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), active: -1, roles: {}, state: { count: 0 }, message: 'Remember each word. A later word pairs with an earlier one when it is the earlier word reversed.' }]
  const seen = new Set()
  let count = 0
  words.forEach((word, i) => {
    const reversed = word[1] + word[0]
    const pairs = seen.has(reversed)
    if (pairs) count += 1
    frames.push({ phase: 'check', activeLine: L(pairs ? 'add 1 to count' : 'if the reverse of word is in seen'), active: i, roles: pairs ? { [i]: 'pair', [words.indexOf(reversed)]: 'partner' } : { [i]: 'checked' }, state: { word, reversed, count }, message: pairs ? `"${word}" reversed is "${reversed}", already seen. Pairs: ${count}.` : `No earlier word is "${reversed}", so "${word}" waits for a partner.` })
    seen.add(word)
  })
  frames.push({ phase: 'done', activeLine: L('return count'), active: -1, roles: {}, state: { count }, message: `Return ${count} pairs.` })
  return { input: words, result: count, items: words, frames }
}

export const code = `maximum number of reversed string pairs
  set count to 0
  set seen to an empty set
  for each word in words
    if the reverse of word is in seen then
      add 1 to count
    add word to seen
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_number_of_string_pairs(words):
    count = 0
    seen = set()
    for word in words:
        if word[::-1] in seen:
            count += 1
        seen.add(word)
    return count
`
