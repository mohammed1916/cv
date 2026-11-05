export const phases = [
  { id: 'start', label: 'Start', description: 'Check whether the whole string is already a palindrome, using a left pointer l and a right pointer r.' },
  { id: 'empty', label: 'Empty', description: 'An empty string needs no steps.' },
  { id: 'compare', label: 'Compare ends', description: 'Move l right and r left while the outer letters match.' },
  { id: 'palindrome', label: 'Palindrome', description: 'The whole string is a palindrome, so one step removes it all.' },
  { id: 'split', label: 'Two steps', description: 'Not a palindrome: remove every a in one step and every b in another.' },
  { id: 'done', label: 'Complete', description: 'Return the number of steps.' },
]

export const examples = [
  { label: 'Not a palindrome', input: '{"s":"ababa"}' },
  { label: 'Palindrome', input: '{"s":"abba"}' },
  { label: 'Mixed letters', input: '{"s":"baabb"}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || typeof data.s !== 'string') throw new Error('Use an object with a string s, such as {"s":"ababa"}.')
  if (data.s.length > 20) throw new Error('s may be at most 20 letters in this visualization.')
  if (!/^[ab]*$/.test(data.s)) throw new Error('s may contain only the letters a and b.')
  return data.s
}

export function buildTrace(input) {
  const s = typeof input === 'string' ? input : input.s
  const n = s.length
  const snap = (l, r, extra = {}) => ({ s, l, r, ...extra })
  const frames = [{ phase: 'start', activeLine: L('if (s.length === 0)'), pythonLine: P('if not s'), snapshot: snap(0, n - 1),
    message: `Check whether ${JSON.stringify(s)} reads the same both ways.` }]
  if (n === 0) {
    frames.push({ phase: 'empty', activeLine: L('return 0'), pythonLine: P('return 0'), snapshot: snap(null, null), message: 'An empty string takes 0 steps.', result: 0 })
    return { input: s, result: 0, frames }
  }
  let l = 0, r = n - 1, palindrome = true
  while (l < r) {
    frames.push({ phase: 'compare', activeLine: L('while (l < r)'), pythonLine: P('while l < r'), snapshot: snap(l, r),
      message: `Compare ${s[l]} at l = ${l} with ${s[r]} at r = ${r}.` })
    if (s[l] !== s[r]) { palindrome = false; break }
    l++; r--
  }
  if (palindrome) {
    frames.push({ phase: 'palindrome', activeLine: L('return 1'), pythonLine: P('return 1'), snapshot: snap(null, null),
      message: 'Every pair matches, so the whole string is a palindrome: one step.', result: 1 })
    return { input: s, result: 1, frames }
  }
  frames.push({ phase: 'split', activeLine: L('return 2'), pythonLine: P('return 2'), snapshot: snap(null, null),
    message: 'The pair did not match, so the string is not a palindrome. Remove all a letters, then all b letters: two steps.', result: 2 })
  frames.push({ phase: 'done', activeLine: L('return 2'), pythonLine: P('return 2'), snapshot: snap(null, null), message: 'Return 2.', result: 2 })
  return { input: s, result: 2, frames }
}

export const code = `function removePalindromeSub(s) {
  if (s.length === 0) return 0
  let l = 0, r = s.length - 1
  while (l < r) {
    if (s[l] !== s[r]) return 2
    l++
    r--
  }
  return 1
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def remove_palindrome_sub(s):
    if not s:
        return 0
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return 2
        l += 1
        r -= 1
    return 1
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
