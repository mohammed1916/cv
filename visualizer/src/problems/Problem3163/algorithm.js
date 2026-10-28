export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 'word') throw new Error('Use a JSON object with exactly one key, word.')
  const { word } = input
  if (typeof word !== 'string' || word.length < 1 || word.length > 40) throw new Error('word must be a string of 1 to 40 letters.')
  if (!/^[a-z]+$/.test(word)) throw new Error('word may contain only lowercase letters a to z.')
  return { word }
}

export function buildTrace({ word }) {
  const frames = [{ phase: 'start', activeLine: L('set result to'), start: -1, length: 0, result: '', message: 'Start at the first letter with an empty result.' }]
  let result = ''
  let i = 0
  while (i < word.length) {
    const ch = word[i]
    let count = 0
    while (i + count < word.length && word[i + count] === ch && count < 9) count++
    result += `${count}${ch}`
    frames.push({ phase: 'chunk', activeLine: L('append that count'), start: i, length: count, result, message: `The run at position ${i} has ${count} copies of ${ch} (capped at 9). Write ${count}${ch}.` })
    i += count
  }
  frames.push({ phase: 'done', activeLine: L('return result'), start: -1, length: 0, result, message: `Compressed word: ${result}.` })
  return { input: { word }, result, frames }
}

export const code = `compressed form of a word:
  set result to empty text
  set i to the first position
  while i is inside the word
    let ch be the letter at position i
    count the copies of ch from position i, at most 9
    append that count and then ch to result
    move i forward by that count
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def compress_word(word):
    result = ''
    i = 0
    while i < len(word):
        ch = word[i]
        count = 0
        while i + count < len(word) and word[i + count] == ch and count < 9:
            count += 1
        result += str(count) + ch
        i += count
    return result
`
