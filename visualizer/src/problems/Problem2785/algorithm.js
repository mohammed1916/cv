const VOWELS = 'aeiouAEIOU'

export function parseInput(text) {
  const input = JSON.parse(text)
  const s = input?.s
  if (typeof s !== 'string' || !/^[A-Za-z]{1,30}$/.test(s)) throw new Error('Use {"s": "..."} with 1 to 30 English letters.')
  return { s }
}

export function buildTrace(input) {
  const chars = [...input.s]
  const positions = []
  chars.forEach((ch, i) => { if (VOWELS.includes(ch)) positions.push(i) })
  const frames = [{ phase: 'collect', pythonLine: 3, activeLine: L('positions.push(i)'), at: null, text: chars.join(''), message: `Vowel positions: ${positions.join(', ') || 'none'}.` }]
  const letters = positions.map(i => chars[i]).sort()
  frames.push({ phase: 'sort', pythonLine: 4, activeLine: L('.sort()'), at: null, text: chars.join(''), sorted: letters.join(''), message: `Sorted vowels by character code: ${letters.join('') || 'none'}.` })
  positions.forEach((pos, k) => {
    chars[pos] = letters[k]
    frames.push({ phase: 'write', pythonLine: 7, activeLine: L('chars[pos] = letters[k]'), at: pos, k, text: chars.join(''), sorted: letters.join(''), message: `Position ${pos} receives ${letters[k]}.` })
  })
  const result = chars.join('')
  frames.push({ phase: 'done', pythonLine: 8, activeLine: L("return chars.join('')"), at: null, text: result, sorted: letters.join(''), message: `Result: ${result}.` })
  return { input, result, frames }
}

export const code = `const VOWELS = 'aeiouAEIOU'
const positions = []
for (let i = 0; i < s.length; i++) if (VOWELS.includes(s[i])) positions.push(i)
const letters = positions.map(i => s[i]).sort()
const chars = [...s]
positions.forEach((pos, k) => { chars[pos] = letters[k] })
return chars.join('')`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sort_vowels(s):
    vowels = set('aeiouAEIOU')
    positions = [i for i, ch in enumerate(s) if ch in vowels]
    letters = sorted(s[i] for i in positions)
    chars = list(s)
    for i, ch in zip(positions, letters):
        chars[i] = ch
    return ''.join(chars)
`
