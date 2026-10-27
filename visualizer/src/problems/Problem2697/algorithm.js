export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.s !== 'string') throw new Error('Use an object with a string s, for example {"s":"egcfe"}.')
  if (data.s.length < 1 || data.s.length > 30) throw new Error('s must have 1 to 30 characters.')
  if (!/^[a-z]+$/.test(data.s)) throw new Error('s may contain only lowercase English letters.')
  return { s: data.s }
}

export function buildTrace({ s }) {
  const frames = []
  const chars = [...s]
  const last = chars.length - 1
  frames.push({ phase: 'start', activeLine: L('set chars to the letters'), index: -1, mirror: -1, chars: [...chars], result: null, message: `Start with ${s}. Each mirrored pair must match, and changing a letter costs one operation.` })
  for (let i = 0; i < chars.length / 2; i++) {
    const j = last - i
    if (chars[i] !== chars[j]) {
      const smaller = chars[i] < chars[j] ? chars[i] : chars[j]
      chars[i] = smaller
      chars[j] = smaller
      frames.push({ phase: 'change', activeLine: L('set both chars'), index: i, mirror: j, chars: [...chars], result: null, message: `Positions ${i} and ${j} differ. Change both to ${smaller}, the smaller letter.` })
    } else {
      frames.push({ phase: 'match', activeLine: L('if chars at i is not'), index: i, mirror: j, chars: [...chars], result: null, message: `Positions ${i} and ${j} already match.` })
    }
  }
  const result = chars.join('')
  frames.push({ phase: 'done', activeLine: L('return the chars joined'), index: -1, mirror: -1, chars: [...chars], result, message: `The smallest palindrome is ${result}.` })
  return { input: { s }, result, frames }
}

export const code = `lexicographically smallest palindrome (s)
  set chars to the letters of s
  for each index i in the first half of s
    let j be the mirror index of i
    if chars at i is not chars at j then
      set both chars at i and j to the smaller letter
  return the chars joined as a string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `def make_smallest_palindrome(s):
    chars = list(s)
    n = len(chars)
    for i in range(n // 2):
        j = n - 1 - i
        if chars[i] != chars[j]:
            chars[i] = chars[j] = min(chars[i], chars[j])
    return ''.join(chars)
`
