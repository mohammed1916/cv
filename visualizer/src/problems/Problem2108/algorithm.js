// LeetCode 2108: Find First Palindromic String in the Array.
// Check each word from the front with two pointers that close in from both ends.
// The first word that reads the same both ways is the answer; otherwise the answer is empty.

export function parseInput(text) {
  let words
  try { words = JSON.parse(text) } catch { throw new Error('Use a JSON array of lowercase words, e.g. ["abc","aba"].') }
  if (!Array.isArray(words) || words.length < 1 || words.length > 12 || words.some(w => typeof w !== 'string' || !/^[a-z]{1,12}$/.test(w))) {
    throw new Error('Use 1 to 12 lowercase words of 1 to 12 letters.')
  }
  return { words }
}

export const code = `function firstPalindrome(words) {
  for (const word of words) {
    let l = 0
    let r = word.length - 1
    while (l < r && word[l] === word[r]) {
      l++
      r--
    }
    if (l >= r) return word
  }
  return ''
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: first_palindrome
def first_palindrome(words):
    for word in words:
        l = 0
        r = len(word) - 1
        while l < r and word[l] == word[r]:
            l += 1
            r -= 1
        if l >= r:
            return word
    return ""
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'word', label: 'Next word', description: 'Take the next word from the front of the array.' },
  { id: 'compare', label: 'Compare ends', description: 'Compare the letter at l with the letter at r and move inward.' },
  { id: 'found', label: 'Palindrome', description: 'The pointers met or crossed: this word is the answer.' },
  { id: 'reject', label: 'Mismatch', description: 'A mismatch proves this word is not a palindrome.' },
  { id: 'done', label: 'Result', description: 'The first palindrome, or an empty string.' },
]

export function buildTrace({ words }) {
  const frames = []
  let answer = null
  const checked = []
  for (let w = 0; w < words.length && answer === null; w++) {
    const word = words[w]
    let l = 0
    let r = word.length - 1
    frames.push({ phase: 'word', activeLine: L('for (const word'), pythonLine: P('for word in words'), message: `Check "${word}" from both ends.`, word, l, r, checked: [...checked], result: null })
    while (l < r && word[l] === word[r]) {
      frames.push({ phase: 'compare', activeLine: L('while (l < r'), pythonLine: P('while l < r'), message: `${word[l]} matches ${word[r]}; move both pointers inward.`, word, l, r, checked: [...checked], result: null })
      l++
      r--
    }
    if (l >= r) {
      answer = word
      frames.push({ phase: 'found', activeLine: L('if (l >= r)'), pythonLine: P('if l >= r'), message: `"${word}" reads the same both ways, so it is the first palindrome.`, word, l, r, checked: [...checked, { word, verdict: 'palindrome' }], result: word })
    } else {
      checked.push({ word, verdict: 'not a palindrome' })
      frames.push({ phase: 'reject', activeLine: L('while (l < r'), pythonLine: P('while l < r'), message: `${word[l]} and ${word[r]} differ, so "${word}" is rejected.`, word, l, r, checked: [...checked], result: null })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return \'\''), pythonLine: P('return ""'), message: answer === null ? 'No word is a palindrome, so the answer is an empty string.' : `The answer is "${answer}".`, word: null, l: -1, r: -1, checked: [...checked], result: answer ?? '' })
  return { input: { words }, result: answer ?? '', frames }
}
