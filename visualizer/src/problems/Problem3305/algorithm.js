const VOWELS = 'aeiou'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (typeof input?.word !== 'string' || input.word.length < 1 || input.word.length > 14 || !/^[a-z]+$/.test(input.word)) throw new Error('Give word as 1 to 14 lowercase letters.')
  if (!Number.isInteger(input.k) || input.k < 0 || input.k > 4) throw new Error('k is an integer from 0 to 4.')
  return { word: input.word, k: input.k }
}

export function buildTrace({ word, k }) {
  const frames = [{ phase: 'start', activeLine: L('set total to zero'), start: 0, end: -1, seen: '', consonants: 0, total: 0, message: `Count substrings that contain a, e, i, o and u, with exactly ${k} consonants.` }]
  let total = 0
  for (let start = 0; start < word.length; start++) {
    const seen = new Set()
    let consonants = 0
    for (let end = start; end < word.length; end++) {
      const letter = word[end]
      if (VOWELS.includes(letter)) seen.add(letter)
      else consonants++
      frames.push({ phase: 'extend', activeLine: L('add the letter at j'), start, end, seen: [...seen].sort().join(''), consonants, total, message: `Add ${letter}. The substring ${start} to ${end} has ${consonants} consonants.` })
      if (consonants > k) {
        frames.push({ phase: 'stop', activeLine: L('stop this start'), start, end, seen: [...seen].sort().join(''), consonants, total, message: `More than ${k} consonants, so later ends from ${start} cannot count.` })
        break
      }
      if (seen.size === 5 && consonants === k) {
        total++
        frames.push({ phase: 'count', activeLine: L('add one to total'), start, end, seen: [...seen].sort().join(''), consonants, total, message: `Substring ${start} to ${end} has all vowels and ${k} consonants. Total ${total}.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), start: 0, end: word.length - 1, seen: '', consonants: 0, total, message: `There are ${total} matching substrings.` })
  return { input: { word, k }, result: total, frames }
}

export const code = `count substrings with all vowels and k consonants (word, k)
  set total to zero
  for each start index i
    set seen to an empty set and consonants to zero
    for each end index j from i
      add the letter at j to seen or to consonants
      if consonants exceed k then stop this start
      if seen has all five vowels and consonants equal k then add one to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_vowel_consonant_substrings(word, k):
    vowels = set('aeiou')
    total = 0
    for start in range(len(word)):
        seen = set()
        consonants = 0
        for end in range(start, len(word)):
            letter = word[end]
            if letter in vowels:
                seen.add(letter)
            else:
                consonants += 1
            if consonants > k:
                break
            if len(seen) == 5 and consonants == k:
                total += 1
    return total
`
