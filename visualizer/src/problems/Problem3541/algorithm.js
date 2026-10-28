const MAX_LENGTH = 30
const VOWELS = 'aeiou'

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > MAX_LENGTH || !/^[a-z]+$/.test(s)) throw new Error(`s must be 1 to ${MAX_LENGTH} lowercase letters.`)
  return s
}

export const code = `sum of the most frequent vowel and the most frequent consonant
  set count to the number of times each letter occurs in s
  set best vowel and best consonant to 0
  for each letter with a count
    if the letter is a vowel then
      set best vowel to the larger of best vowel and its count
    otherwise
      set best consonant to the larger of best consonant and its count
  return best vowel plus best consonant`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(s) {
  const count = {}
  const frames = [{ phase: 'start', letter: null, bestVowel: 0, bestConsonant: 0, activeLine: L('set count to'), message: 'Count how often each letter occurs in s.' }]
  for (const ch of s) count[ch] = (count[ch] ?? 0) + 1
  let bestVowel = 0
  let bestConsonant = 0
  for (const [letter, c] of Object.entries(count)) {
    const vowel = VOWELS.includes(letter)
    if (vowel) bestVowel = Math.max(bestVowel, c)
    else bestConsonant = Math.max(bestConsonant, c)
    frames.push({ phase: vowel ? 'vowel' : 'consonant', letter, bestVowel, bestConsonant, activeLine: vowel ? L('set best vowel to') : L('set best consonant to'), message: `${letter} occurs ${c} times and is a ${vowel ? 'vowel' : 'consonant'}.` })
  }
  const result = bestVowel + bestConsonant
  frames.push({ phase: 'done', letter: null, bestVowel, bestConsonant, activeLine: L('return best vowel plus'), message: `${bestVowel} + ${bestConsonant} = ${result}.` })
  return { input: s, result, frames }
}

export const python = `def most_frequent_vowel_plus_consonant(s):
    count = {}
    for ch in s:
        count[ch] = count.get(ch, 0) + 1
    best_vowel = 0
    best_consonant = 0
    for ch in count:
        if ch in 'aeiou':
            best_vowel = max(best_vowel, count[ch])
        else:
            best_consonant = max(best_consonant, count[ch])
    return best_vowel + best_consonant
`
