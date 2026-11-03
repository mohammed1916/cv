export const phases = [
  { id: 'start', label: 'Start', description: 'Copy the string into a list so each ? can be replaced in place.' },
  { id: 'scan', label: 'Scan left to right', description: 'Look at each position. Fixed letters stay; every ? needs a letter.' },
  { id: 'choose', label: 'Choose a letter', description: 'Pick the first of a, b, c that differs from both neighbours at that moment.' },
  { id: 'done', label: 'Complete', description: 'Every ? is replaced and no two neighbours match.' },
]

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !/^[a-z?]+$/.test(s)) {
    throw new Error('Enter a JSON string of 1 to 20 lowercase letters and ? marks.')
  }
  for (let i = 1; i < s.length; i++) {
    if (s[i] !== '?' && s[i] === s[i - 1]) throw new Error(`Positions ${i - 1} and ${i} already repeat the letter ${s[i]}, so no replacement can fix it.`)
  }
  return s
}

export const code = [
  'function replace_marks(s):',
  '  chars = copy of s as a list',
  '  for each index i in chars:',
  '    if chars[i] == "?":',
  '      chars[i] = first of a, b, c not equal to chars[i-1] or chars[i+1]',
  '  return join(chars)',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def modify_string(s):
    chars = list(s)
    for i in range(len(chars)):
        if chars[i] == '?':
            left = chars[i - 1] if i > 0 else ''
            right = chars[i + 1] if i + 1 < len(chars) else ''
            chars[i] = next(c for c in 'abc' if c != left and c != right)
    return ''.join(chars)`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(s) {
  const chars = s.split('')
  const snap = (index, extra = {}) => ({ index, chars: [...chars], ...extra })
  const frames = [{ phase: 'start', activeLine: L('chars = copy'), pythonLine: P('chars = list'), snapshot: snap(null), message: 'Work left to right. Each ? becomes a letter that differs from both neighbours at that moment.' }]
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '?') {
      frames.push({ phase: 'scan', activeLine: L('for each index'), pythonLine: P('for i in range'), snapshot: snap(i), message: `Position ${i} is ${s[i]}, a fixed letter. It stays.` })
      continue
    }
    const left = i > 0 ? chars[i - 1] : ''
    const right = i + 1 < s.length ? chars[i + 1] : ''
    frames.push({ phase: 'scan', activeLine: L('if chars[i] =='), pythonLine: P("if chars[i] == '?'"), snapshot: snap(i), message: `Position ${i} is ?. Left neighbour: ${left || 'none'}. Right neighbour: ${right === '?' ? 'still a ?, which will avoid this letter later' : right || 'none'}.` })
    const pick = 'abc'.split('').find(c => c !== left && c !== right)
    chars[i] = pick
    frames.push({ phase: 'choose', activeLine: L('chars[i] = first'), pythonLine: P('chars[i] = next'), snapshot: snap(i), message: `Choose ${pick}, the first of a, b, c that differs from both neighbours.` })
  }
  frames.push({ phase: 'done', activeLine: L('return join'), pythonLine: P("return ''.join"), snapshot: snap(null), message: `Result: ${chars.join('')}.` })
  return { input: s, result: chars.join(''), frames }
}
