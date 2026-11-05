export const phases = [
  { id: 'start', label: 'Find boundary', description: 'Locate the first occurrence of ch; that index is the right end of the reversed prefix.' },
  { id: 'swap', label: 'Swap inward', description: 'Move l from the start and r from the boundary toward each other, swapping each pair.' },
  { id: 'done', label: 'Result', description: 'The prefix is reversed and the rest of the word is unchanged.' },
]

export const code = `function reversePrefix(word, ch) {
  const index = word.indexOf(ch)
  if (index === -1) return word
  const chars = [...word]
  let left = 0
  let right = index
  while (left < right) {
    [chars[left], chars[right]] = [chars[right], chars[left]]
    left++
    right--
  }
  return chars.join('')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def reverse_prefix(word, ch):
    index = word.find(ch)
    if index == -1:
        return word
    chars = list(word)
    left = 0
    right = index
    while left < right:
        chars[left], chars[right] = chars[right], chars[left]
        left += 1
        right -= 1
    return ''.join(chars)
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"word":"abcdefd","ch":"d"}.') }
  const { word, ch } = obj || {}
  if (typeof word !== 'string' || word.length < 1 || word.length > 100 || !/^[a-z]+$/.test(word)) throw new Error('word must be 1 to 100 lowercase letters.')
  if (typeof ch !== 'string' || ch.length !== 1 || !/^[a-z]$/.test(ch)) throw new Error('ch must be a single lowercase letter.')
  return { word, ch }
}

export function buildTrace({ word, ch }) {
  const frames = []
  const index = word.indexOf(ch)
  const chars = [...word]
  const add = (phase, c, p, message, left, right) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { chars: chars.slice(), left, right, boundary: index, ch },
  })
  add('start', 'const index = word.indexOf', 'index = word.find', index === -1 ? `${ch} is absent, so the word is returned unchanged.` : `The first ${ch} is at index ${index}; the prefix 0 to ${index} is reversed.`, -1, -1)
  if (index !== -1) {
    let left = 0, right = index
    while (left < right) {
      ;[chars[left], chars[right]] = [chars[right], chars[left]]
      add('swap', '[chars[left], chars[right]]', 'chars[left], chars[right]', `Swap positions ${left} and ${right}.`, left, right)
      left++
      right--
    }
  }
  const result = chars.join('')
  add('done', 'return chars.join', "return ''.join", `Result: ${result}.`, -1, -1)
  return { input: { word, ch }, result, frames }
}
