// LeetCode 2131: Longest Palindrome by Concatenating Two Letter Words.
// A word xy pairs with a copy of yx, adding 4 letters to the palindrome (one on each side).
// A word xx pairs with itself: floor(count / 2) pairs. One leftover xx may sit in the middle, adding 2.

export function parseInput(text) {
  let words
  try { words = JSON.parse(text) } catch { throw new Error('Use a JSON array of two-letter lowercase words, e.g. ["lc","cl","gg"].') }
  if (!Array.isArray(words) || words.length < 1 || words.length > 40 || words.some(w => typeof w !== 'string' || !/^[a-z]{2}$/.test(w))) {
    throw new Error('Use 1 to 40 two-letter lowercase words.')
  }
  return { words }
}

export const code = `function longestPalindrome(words) {
  const count = new Map()
  for (const word of words) count.set(word, (count.get(word) ?? 0) + 1)
  let length = 0
  let middle = false
  for (const [word, n] of count) {
    const reversed = word[1] + word[0]
    if (word[0] === word[1]) {
      length += Math.floor(n / 2) * 4
      if (n % 2 === 1) middle = true
    } else if (word < reversed) {
      length += Math.min(n, count.get(reversed) ?? 0) * 4
    }
  }
  return length + (middle ? 2 : 0)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: longest_palindrome
def longest_palindrome(words):
    count = {}
    for word in words:
        count[word] = count.get(word, 0) + 1
    length = 0
    middle = False
    for word, n in count.items():
        reversed_word = word[1] + word[0]
        if word[0] == word[1]:
            length += (n // 2) * 4
            if n % 2 == 1:
                middle = True
        elif word < reversed_word:
            length += min(n, count.get(reversed_word, 0)) * 4
    return length + (2 if middle else 0)
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
  { id: 'count', label: 'Count words', description: 'Count how many times each two-letter word appears.' },
  { id: 'pair', label: 'Mirror pairs', description: 'Each xy is paired with as many yx copies as exist.' },
  { id: 'double', label: 'Doubled letters', description: 'xx words pair with each other; one leftover can sit in the middle.' },
  { id: 'done', label: 'Result', description: 'The total length.' },
]

export function buildTrace({ words }) {
  const frames = []
  const count = new Map()
  for (const word of words) count.set(word, (count.get(word) ?? 0) + 1)
  const rows = [...count].map(([word, n]) => ({ word, count: n, used: '–' }))
  frames.push({ phase: 'count', activeLine: L('const count = new Map'), pythonLine: P('count = {}'), message: `${count.size} distinct words.`, rows: [...rows], length: 0, middle: false, current: null })
  let length = 0
  let middle = false
  for (const [word, n] of count) {
    const reversed = word[1] + word[0]
    if (word[0] === word[1]) {
      const pairs = Math.floor(n / 2)
      length += pairs * 4
      if (n % 2 === 1) middle = true
      rows.find(r => r.word === word).used = `${pairs} pair(s), ${n % 2 ? 'one left for the middle' : 'none left'}`
      frames.push({ phase: 'double', activeLine: L('length += Math.floor'), pythonLine: P('length += (n // 2)'), message: `${word} appears ${n} times: ${pairs} pair(s), adding ${pairs * 4}.`, rows: [...rows], length, middle, current: word })
    } else if (word < reversed) {
      const pairs = Math.min(n, count.get(reversed) ?? 0)
      length += pairs * 4
      rows.find(r => r.word === word).used = `${pairs} pair(s) with ${reversed}`
      frames.push({ phase: 'pair', activeLine: L('length += Math.min'), pythonLine: P('length += min'), message: `${word} pairs with ${reversed}: ${pairs} pair(s), adding ${pairs * 4}.`, rows: [...rows], length, middle, current: word })
    }
  }
  const result = length + (middle ? 2 : 0)
  frames.push({ phase: 'done', activeLine: L('return length +'), pythonLine: P('return length +'), message: `Longest palindrome length: ${result}${middle ? ' (includes a middle word)' : ''}.`, rows: [...rows], length: result, middle, current: null })
  return { input: { words }, result, frames }
}
