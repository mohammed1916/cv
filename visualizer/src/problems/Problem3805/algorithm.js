export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.words)) throw new Error('Use an object with a words array.')
  const { words } = input
  if (words.length < 1 || words.length > 12) throw new Error('words has 1 to 12 strings.')
  if (!words.every(w => typeof w === 'string' && /^[a-z]{1,8}$/.test(w))) throw new Error('Each word has 1 to 8 lowercase letters.')
  if (new Set(words.map(w => w.length)).size !== 1) throw new Error('All words must have the same length.')
  return { words }
}

// Two words are similar exactly when their letter gaps from the first letter agree.
export function gapKey(word) {
  const base = word.charCodeAt(0)
  return [...word].map(ch => (ch.charCodeAt(0) - base + 26) % 26).join(',')
}

export function buildTrace({ words }) {
  const frames = []
  const counts = new Map()
  let pairs = 0
  words.forEach((word, i) => {
    const key = gapKey(word)
    frames.push({ pythonLine: P('key = '), phase: 'key', activeLine: C('compute the gap signature'), at: i, key, matches: counts.get(key) || 0, pairs,
      message: `words[${i}] = "${word}" has gap signature ${key}.` })
    const matches = counts.get(key) || 0
    pairs += matches
    counts.set(key, matches + 1)
    frames.push({ pythonLine: P('pairs +='), phase: 'pair', activeLine: C('add the earlier matches'), at: i, key, matches, pairs,
      message: `${matches} earlier word${matches === 1 ? '' : 's'} match, so pairs is now ${pairs}.` })
  })
  frames.push({ pythonLine: P('return pairs'), phase: 'done', activeLine: C('return pairs'), at: -1, key: '', matches: 0, pairs, message: `${pairs} similar pair${pairs === 1 ? '' : 's'}.` })
  return { input: { words }, result: pairs, frames }
}

export function solve(words) {
  return buildTrace({ words }).result
}

export const code = `count pairs of similar words
  set pairs to 0 and an empty map of signature counts
  for each word in order
    compute the gap signature from its first letter
    add the earlier matches with this signature to pairs
    increase the count for this signature
  return pairs`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `def count_caesar_pairs(words):
    counts = {}
    pairs = 0
    for word in words:
        base = ord(word[0])
        key = tuple((ord(ch) - base) % 26 for ch in word)
        matches = counts.get(key, 0)
        pairs += matches
        counts[key] = matches + 1
    return pairs
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
