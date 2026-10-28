export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || typeof obj.word !== 'string') throw new Error('Use an object with a string key word.')
  const { word } = obj
  if (word.length < 1 || word.length > 30 || !/^[a-z]+$/.test(word)) throw new Error('word is 1 to 30 lowercase letters.')
  return { word }
}

export function buildTrace(input) {
  const { word } = input
  let count = 0
  let last = null
  const changed = []
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), index: -1, changed: [], count, message: 'Two letters are almost equal when they are equal or neighbours in the alphabet.' }]
  for (let i = 0; i < word.length; i++) {
    const code2 = word.charCodeAt(i) - 97
    if (last !== null && Math.abs(code2 - last) <= 1) {
      count += 1
      changed.push(i)
      last = null
      frames.push({ phase: 'change', activeLine: L('add 1 to count'), index: i, changed: [...changed], count, message: `${word[i]} is almost equal to the letter before it, so it changes. Changes: ${count}.` })
    } else {
      last = code2
      frames.push({ phase: 'keep', activeLine: L('set last to ch'), index: i, changed: [...changed], count, message: `${word[i]} stays as it is.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), index: -1, changed: [...changed], count, message: `Minimum changes: ${count}.` })
  return { input, word, result: count, frames }
}

export const code = `minimum changes so that no two neighbours are almost equal
  set count to 0
  set last to nothing
  for each letter ch at index i
    if last is set and ch is almost equal to last then
      add 1 to count
      set last to nothing
    otherwise
      set last to ch
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def remove_almost_equal_changes(word):
    count = 0
    last = None
    for ch in word:
        if last is not None and abs(ord(ch) - ord(last)) <= 1:
            count += 1
            last = None
        else:
            last = ch
    return count
`
