const WORD = /^[a-z]{2}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.words)) throw new Error('Use an object with a words list.')
  const { words } = input
  if (words.length < 1 || words.length > 4) throw new Error('words has 1 to 4 entries.')
  if (!words.every(w => typeof w === 'string' && WORD.test(w))) throw new Error('Each word is two lowercase letters.')
  if (new Set(words).size !== words.length) throw new Error('Words must be distinct.')
  if (new Set(words.join('')).size > 4) throw new Error('Use at most 4 distinct letters.')
  return { words }
}

const isSubsequence = (word, text) => {
  const it = text[Symbol.iterator]()
  return [...word].every(ch => {
    for (let step = it.next(); !step.done; step = it.next()) if (step.value === ch) return true
    return false
  })
}
const containsAll = (text, words) => words.every(w => isSubsequence(w, text))
const compareVectors = (a, b) => {
  for (let i = 0; i < 26; i++) if (a[i] !== b[i]) return a[i] - b[i]
  return 0
}

export function buildTrace({ words }) {
  const letters = [...new Set(words.join(''))].sort()
  const frames = []
  frames.push({ pythonLine: 1, phase: 'start', activeLine: L('letters = the unique'), at: -1, candidate: '', message: `Letters in play: ${letters.join(' ')}.` })
  let kept = []
  for (let length = 1; length <= 2 * words.length && kept.length === 0; length++) {
    frames.push({ pythonLine: 3, phase: 'length', activeLine: L('for length'), at: -1, candidate: '', message: `Try strings of length ${length}.` })
    const found = []
    const build = prefix => {
      if (prefix.length === length) {
        if (containsAll(prefix, words)) found.push(prefix)
        return
      }
      for (const ch of letters) build(prefix + ch)
    }
    build('')
    for (const candidate of found) {
      frames.push({ pythonLine: 5, phase: 'found', activeLine: L('if every word'), at: -1, candidate, message: `${candidate} contains every word in order.` })
    }
    kept = found
  }
  const byProfile = new Map()
  for (const text of kept) {
    const vector = Array(26).fill(0)
    for (const ch of text) vector[ch.charCodeAt(0) - 97]++
    const key = vector.join(',')
    if (!byProfile.has(key)) byProfile.set(key, vector)
  }
  const result = [...byProfile.values()].sort(compareVectors)
  frames.push({ pythonLine: 7, phase: 'done', activeLine: L('return the distinct'), at: -1, candidate: kept[0] || '', message: `${result.length} distinct letter-count profile${result.length === 1 ? '' : 's'}.` })
  return { input: { words }, frames, result }
}

export const code = `letters = the unique letters in words
for length from 1 up to 2 * number of words
  for each string of that length over letters
    if every word is a subsequence of it, keep it
  if anything was kept, stop
group kept strings by letter counts
return the distinct count arrays`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from itertools import product

def is_subsequence(word, text):
    it = iter(text)
    return all(ch in it for ch in word)

def frequencies_of_shortest_supersequences(words):
    letters = sorted(set("".join(words)))
    for length in range(1, 2 * len(words) + 1):
        kept = [s for s in product(letters, repeat=length)
                if all(is_subsequence(w, s) for w in words)]
        if kept:
            break
    profiles = set()
    for s in kept:
        counts = [0] * 26
        for ch in s:
            counts[ord(ch) - 97] += 1
        profiles.add(tuple(counts))
    return [list(p) for p in sorted(profiles)]
`
