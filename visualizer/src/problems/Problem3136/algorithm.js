export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with a word key.')
  const { word } = input
  if (typeof word !== 'string' || word.length < 1 || word.length > 20) throw new Error('word is a string of 1 to 20 characters.')
  if (!/^[A-Za-z0-9@#$]+$/.test(word)) throw new Error('word may contain only letters, digits, @, # and $.')
  return { word }
}

export function buildTrace(input) {
  const { word } = input
  const frames = [{ phase: 'start', activeLine: L('if the word is shorter than 3'), index: -1, hasVowel: false, hasConsonant: false, message: `Check a word of length ${word.length}.` }]
  if (word.length < 3) {
    frames.push({ phase: 'reject', activeLine: L('if the word is shorter than 3'), index: -1, hasVowel: false, hasConsonant: false, message: 'Shorter than 3 characters, so it is not valid.' })
    return { input, result: false, frames }
  }
  let hasVowel = false
  let hasConsonant = false
  for (let i = 0; i < word.length; i++) {
    const ch = word[i]
    if (!/[A-Za-z0-9]/.test(ch)) {
      frames.push({ phase: 'reject', activeLine: L('if the character is not a letter or digit'), index: i, hasVowel, hasConsonant, message: `"${ch}" is not a letter or digit, so the word is not valid.` })
      return { input, result: false, frames }
    }
    if (/[A-Za-z]/.test(ch)) {
      if (/[aeiou]/i.test(ch)) hasVowel = true
      else hasConsonant = true
    }
    frames.push({ phase: 'scan', activeLine: L('mark it as a vowel'), index: i, hasVowel, hasConsonant, message: `Character ${i}, "${ch}", checked; vowel ${hasVowel ? 'seen' : 'not yet'}, consonant ${hasConsonant ? 'seen' : 'not yet'}.` })
  }
  const result = hasVowel && hasConsonant
  frames.push({ phase: 'done', activeLine: L('return has vowel and has consonant'), index: -1, hasVowel, hasConsonant, message: result ? 'Has a vowel and a consonant, so the word is valid.' : 'Missing a vowel or a consonant, so the word is not valid.' })
  return { input, result, frames }
}

export const code = `is the word valid:
  if the word is shorter than 3 then return false
  set has vowel and has consonant to false
  for each character
    if the character is not a letter or digit then return false
    if the character is a letter then mark it as a vowel or a consonant
  return has vowel and has consonant`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def is_valid_word(word):
    if len(word) < 3:
        return False
    has_vowel = False
    has_consonant = False
    for ch in word:
        if not (ch.isascii() and ch.isalnum()):
            return False
        if ch.isalpha():
            if ch.lower() in 'aeiou':
                has_vowel = True
            else:
                has_consonant = True
    return has_vowel and has_consonant
`
