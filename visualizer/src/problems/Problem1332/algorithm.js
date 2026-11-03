export const phases = [
  { id: 'start', label: 'Start', description: 'Read the string of a and b characters and check whether it has any content.' },
  { id: 'compare', label: 'Compare ends', description: 'Walk inward from both ends. One mismatch means the string is not a palindrome.' },
  { id: 'one', label: 'One palindrome', description: 'The whole string is a palindrome, so one removal of all of it finishes the job.' },
  { id: 'two', label: 'Two removals', description: 'Remove every a in one step and every b in another. Each step removes a palindrome.' },
  { id: 'done', label: 'Complete', description: 'Return the fewest removals: 0 for empty, 1 for a palindrome, otherwise 2.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"s": "abba"}.')
  const { s } = input
  if (typeof s !== 'string' || s.length > 20) throw new Error('s is a string of at most 20 characters.')
  if (!/^[ab]*$/.test(s)) throw new Error('s uses only the letters a and b.')
  return { s }
}

export function buildTrace({ s }) {
  const snap = (left, right, mismatch = false) => ({ chars: s.split(''), left, right, mismatch })
  const frames = [{ phase: 'start', activeLine: L('if s is empty'), pythonLine: P('if not s'), snapshot: snap(null, null), message: `Checking "${s}".` }]
  if (s.length === 0) {
    frames.push({ phase: 'done', activeLine: L('return 0'), pythonLine: P('return 0'), snapshot: snap(null, null), message: 'The string is empty, so no removal is needed.' })
    return { input: { s }, result: 0, frames }
  }
  let left = 0
  let right = s.length - 1
  while (left < right) {
    if (s[left] !== s[right]) {
      frames.push({ phase: 'compare', activeLine: L('if s[left] != s[right]'), pythonLine: P('if s[left] != s[right]'), snapshot: snap(left, right, true), message: `Positions ${left} (${s[left]}) and ${right} (${s[right]}) differ, so the string is not a palindrome.` })
      frames.push({ phase: 'two', activeLine: L('return 2'), pythonLine: P('return 2'), snapshot: snap(left, right, true), message: 'Remove all a characters, then all b characters. The answer is 2.' })
      return { input: { s }, result: 2, frames }
    }
    frames.push({ phase: 'compare', activeLine: L('move left'), pythonLine: P('left, right'), snapshot: snap(left, right), message: `Positions ${left} and ${right} both hold ${s[left]}. Keep moving inward.` })
    left++
    right--
  }
  frames.push({ phase: 'one', activeLine: L('return 1'), pythonLine: P('return 1'), snapshot: snap(null, null), message: `Every mirrored pair matched, so "${s}" is a palindrome. One removal finishes it.` })
  return { input: { s }, result: 1, frames }
}

export const code = `remove palindromic (s):
  if s is empty: return 0
  left = first index, right = last index
  while left < right:
    if s[left] != s[right]: return 2
    move left one step right, right one step left
  return 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def remove_palindromic_subsequences(s):
    if not s:
        return 0
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return 2
        left += 1
        right -= 1
    return 1
`
