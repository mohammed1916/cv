export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with an s key.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[a-z ]+$/.test(s)) throw new Error('s is 1 to 30 lowercase letters and spaces.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  let vowels = 0
  let consonants = 0
  const frames = [{ phase: 'start', activeLine: L('set vowels and consonants to 0'), index: -1, vowels, consonants, score: 0, message: 'Count vowels and consonants; spaces count for neither.' }]
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if ('aeiou'.includes(ch)) vowels += 1
    else if (/[a-z]/.test(ch)) consonants += 1
    frames.push({ phase: 'scan', activeLine: L('if the character is a vowel'), index: i, vowels, consonants, score: consonants === 0 ? 0 : Math.floor(vowels / consonants), message: `"${ch === ' ' ? 'space' : ch}" at ${i}: vowels ${vowels}, consonants ${consonants}.` })
  }
  const result = consonants === 0 ? 0 : Math.floor(vowels / consonants)
  frames.push({ phase: 'done', activeLine: L('return vowels divided by consonants'), index: -1, vowels, consonants, score: result, message: `Score ${result}.` })
  return { input, result, frames }
}

export const code = `vowel to consonant score of s:
  set vowels and consonants to 0
  for each character
    if the character is a vowel then add one to vowels
    otherwise if the character is a letter then add one to consonants
  if consonants is 0 then return 0
  return vowels divided by consonants, rounded down`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def vowel_consonant_score(s):
    vowels = 0
    consonants = 0
    for ch in s:
        if ch in 'aeiou':
            vowels += 1
        elif ch.isalpha():
            consonants += 1
    if consonants == 0:
        return 0
    return vowels // consonants
`
