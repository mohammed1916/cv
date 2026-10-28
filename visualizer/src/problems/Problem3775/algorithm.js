export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 's') throw new Error('Use a JSON object with exactly one key, s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 80) throw new Error('s must be a string of 1 to 80 characters.')
  if (!/^[a-z]+( [a-z]+)*$/.test(s)) throw new Error('s must be lowercase words separated by single spaces.')
  return { s }
}

const vowelCount = word => [...word].filter(ch => 'aeiou'.includes(ch)).length

export function buildTrace({ s }) {
  const words = s.split(' ')
  const target = vowelCount(words[0])
  const frames = [{ phase: 'start', activeLine: L('set target to'), index: -1, target, words: [...words], message: `The first word ${words[0]} has ${target} vowels. It stays as it is.` }]
  const out = [words[0]]
  for (let i = 1; i < words.length; i++) {
    const count = vowelCount(words[i])
    const reverse = count === target
    const piece = reverse ? [...words[i]].reverse().join('') : words[i]
    out.push(piece)
    frames.push({ phase: reverse ? 'reverse' : 'keep', activeLine: L(reverse ? 'reverse the word' : 'otherwise keep'), index: i, target, words: [...out, ...words.slice(i + 1)], message: reverse ? `${words[i]} has ${count} vowels, the same as the first word, so it becomes ${piece}.` : `${words[i]} has ${count} vowels, which differs, so it is kept.` })
  }
  const result = out.join(' ')
  frames.push({ phase: 'done', activeLine: L('return the words'), index: -1, target, words: out, message: `Result: ${result}.` })
  return { input: { s }, result, frames }
}

export const code = `words with the same vowel count:
  split s into words at spaces
  set target to the number of vowels in the first word
  keep the first word as it is
  for each later word
    count the vowels in this word
    if the count equals target then
      reverse the word, letter by letter
    otherwise keep the word as it is
  join the words with single spaces
  return the words joined`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def reverse_words(s):
    words = s.split(' ')
    target = sum(1 for ch in words[0] if ch in 'aeiou')
    out = [words[0]]
    for word in words[1:]:
        count = sum(1 for ch in word if ch in 'aeiou')
        if count == target:
            out.append(word[::-1])
        else:
            out.append(word)
    return ' '.join(out)
`
