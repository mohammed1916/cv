export const phases = [
  { id: 'start', label: 'Start', description: 'A palindrome reads the same both ways; one changed letter must break the symmetry.' },
  { id: 'single', label: 'One letter', description: 'A one-letter palindrome cannot be broken into a different palindrome-free string, so the answer is empty.' },
  { id: 'compare', label: 'Check left half', description: 'Compare the left pointer l with the mirror position r; the first letter that is not a is the best place to change.' },
  { id: 'change', label: 'Set to a', description: 'Replace that letter with a; the result is smaller and no longer a palindrome.' },
  { id: 'last', label: 'Change last letter', description: 'If the left half is all a, change the last letter to b; that is the smallest change that breaks the palindrome.' },
  { id: 'done', label: 'Complete', description: 'Return the new string, or an empty string when no change is possible.' },
]

export const examples = [
  { label: 'Change the first non-a', input: '{"text":"abccba"}' },
  { label: 'Left half all a', input: '{"text":"aaaaa"}' },
  { label: 'One letter', input: '{"text":"z"}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object') throw new Error('Use an object with a text string, such as {"text":"aba"}.')
  const t = data.text
  if (typeof t !== 'string' || t.length < 1 || t.length > 30) throw new Error('text must have 1 to 30 letters in this visualization.')
  if (!/^[a-z]+$/.test(t)) throw new Error('text must use lowercase letters only.')
  for (let i = 0, j = t.length - 1; i < j; i++, j--) {
    if (t[i] !== t[j]) throw new Error('text must be a palindrome: it must read the same forward and backward.')
  }
  return t
}

export function buildTrace(input) {
  const text = typeof input === 'string' ? input : input.text
  const s = text.split('')
  const n = s.length
  const snap = (l, r, extra = {}) => ({ s: [...s], l, r, ...extra })
  const frames = [{ phase: 'start', activeLine: L('if (n === 1)'), pythonLine: P('if n == 1'), snapshot: snap(0, n - 1),
    message: `Start with ${JSON.stringify(text)}. Compare pairs from the outside in.` }]
  if (n === 1) {
    frames.push({ phase: 'single', activeLine: L('return ""'), pythonLine: P('return ""'), snapshot: snap(0, 0),
      message: 'A one-letter string cannot become a different non-palindrome, so return an empty string.', result: '' })
    return { input: text, result: '', frames }
  }
  let result = null
  for (let i = 0; i < Math.floor(n / 2); i++) {
    frames.push({ phase: 'compare', activeLine: L('for (let i = 0'), pythonLine: P('for i in range'), snapshot: snap(i, n - 1 - i),
      message: `Compare l = ${i} with r = ${n - 1 - i}. The letter ${s[i]} ${s[i] === 'a' ? 'is already a, so keep going' : 'is not a, so change it to a'}.` })
    if (s[i] !== 'a') {
      s[i] = 'a'
      result = s.join('')
      frames.push({ phase: 'change', activeLine: L("s[i] = 'a'"), pythonLine: P("s[i] = 'a'"), snapshot: snap(i, n - 1 - i),
        message: `Change position ${i} to a, giving ${result}.` })
      break
    }
  }
  if (result === null) {
    s[n - 1] = 'b'
    result = s.join('')
    frames.push({ phase: 'last', activeLine: L("s[n - 1] = 'b'"), pythonLine: P("s[n - 1] = 'b'"), snapshot: snap(null, null),
      message: `Every letter in the left half is a, so change the last letter to b: ${result}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return s.join'), pythonLine: P('return'), snapshot: snap(null, null),
    message: `Return "${result}".`, result })
  return { input: text, result, frames }
}

export const code = `function breakPalindrome(text) {
  const s = text.split('')
  const n = s.length
  if (n === 1) return ''
  for (let i = 0; i < Math.floor(n / 2); i++) {
    if (s[i] !== 'a') {
      s[i] = 'a'
      return s.join('')
    }
  }
  s[n - 1] = 'b'
  return s.join('')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def break_palindrome(text):
    s = list(text)
    n = len(s)
    if n == 1:
        return ""
    for i in range(n // 2):
        if s[i] != 'a':
            s[i] = 'a'
            return "".join(s)
    s[n - 1] = 'b'
    return "".join(s)
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
