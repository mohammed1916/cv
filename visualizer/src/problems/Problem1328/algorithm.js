export const phases = [
  { id: 'start', label: 'Start', description: 'Read the palindrome. Every change must leave the result non-palindromic and as early in the alphabet as possible.' },
  { id: 'length', label: 'Check length', description: 'A single character can only become the empty string when it is broken.' },
  { id: 'scan', label: 'Scan first half', description: 'Look for the first position in the first half that is not a. Its mirror partner is unchanged, so changing it breaks the palindrome.' },
  { id: 'replace', label: 'Set to a', description: 'Set that character to a. It is now smaller and the two mirrored ends differ.' },
  { id: 'last', label: 'Change last to b', description: 'If the first half is all a, the last character must change. Setting it to b is the smallest option that breaks symmetry.' },
  { id: 'done', label: 'Complete', description: 'Return the broken string, or the empty string for a single character.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"text": "level"}.')
  const { text: value } = input
  if (typeof value !== 'string' || value.length < 1 || value.length > 30) throw new Error('text is a string of 1 to 30 characters.')
  if (!/^[a-z]+$/.test(value)) throw new Error('text uses lowercase letters only.')
  if (value !== [...value].reverse().join('')) throw new Error('text must be a palindrome.')
  return { text: value }
}

export function buildTrace({ text }) {
  const chars = text.split('')
  const n = chars.length
  const snap = (index, changed = null) => ({ chars: [...chars], index, changed, half: Math.floor(n / 2) })
  const frames = [{ phase: 'start', activeLine: L('if length of text is 1'), pythonLine: P('if len(palindrome) == 1'), snapshot: snap(null), message: `Breaking "${text}" by changing one character.` }]
  if (n === 1) {
    frames.push({ phase: 'done', activeLine: L('return empty'), pythonLine: P('return ""'), snapshot: snap(null), message: 'A single character has no nonpalindrome from one change, so the answer is the empty string.' })
    return { input: { text }, result: '', frames }
  }
  frames.push({ phase: 'length', activeLine: L('if length of text is 1'), pythonLine: P('if len(palindrome) == 1'), snapshot: snap(null), message: `Length ${n} is at least 2, so the first half can be searched.` })
  for (let i = 0; i < Math.floor(n / 2); i++) {
    if (chars[i] !== 'a') {
      const before = chars[i]
      chars[i] = 'a'
      frames.push({ phase: 'scan', activeLine: L('if text[i] is not a'), pythonLine: P("if chars[i] != 'a'"), snapshot: snap(i), message: `Position ${i} holds ${before}, which is not a. Its mirror is unchanged, so the palindrome breaks here.` })
      frames.push({ phase: 'replace', activeLine: L('set text[i] to a'), pythonLine: P("chars[i] = 'a'"), snapshot: snap(i, i), message: `Set position ${i} to a, giving "${chars.join('')}".` })
      return { input: { text }, result: chars.join(''), frames: [...frames, { phase: 'done', activeLine: L('return text'), pythonLine: P("return ''.join(chars)"), snapshot: snap(null, i), message: `Return "${chars.join('')}".` }] }
    }
    frames.push({ phase: 'scan', activeLine: L('for each position i'), pythonLine: P('for i in range'), snapshot: snap(i), message: `Position ${i} is already a, so keep scanning the first half.` })
  }
  chars[n - 1] = 'b'
  frames.push({ phase: 'last', activeLine: L('set last character to b'), pythonLine: P("chars[-1] = 'b'"), snapshot: snap(n - 1, n - 1), message: `The first half is all a, so change the last character to b, giving "${chars.join('')}".` })
  frames.push({ phase: 'done', activeLine: L('return text'), pythonLine: P("return ''.join(chars)"), snapshot: snap(null, n - 1), message: `Return "${chars.join('')}".` })
  return { input: { text }, result: chars.join(''), frames }
}

export const code = `break palindrome (text):
  if length of text is 1: return empty
  for each position i in the first half:
    if text[i] is not a:
      set text[i] to a
      return text
  set last character to b
  return text`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def break_palindrome(palindrome):
    if len(palindrome) == 1:
        return ""
    chars = list(palindrome)
    for i in range(len(chars) // 2):
        if chars[i] != 'a':
            chars[i] = 'a'
            return ''.join(chars)
    chars[-1] = 'b'
    return ''.join(chars)
`
