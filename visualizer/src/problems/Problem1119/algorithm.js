export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty output string.' },
  { id: 'inspect', label: 'Check letter', description: 'Decide whether this letter is a vowel.' },
  { id: 'update', label: 'Keep letter', description: 'A letter that is not a vowel is appended to the output.' },
  { id: 'done', label: 'Answer', description: 'The output holds every kept letter in its original order.' },
]

const VOWELS = 'aeiou'

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.s !== 'string') throw new Error('Use an object with a string s, for example {"s":"sketching"}.')
  if (data.s.length < 1 || data.s.length > 60) throw new Error('s must have 1 to 60 characters.')
  if (!/^[a-z]+$/.test(data.s)) throw new Error('s may contain only lowercase letters a to z.')
  return { s: data.s }
}

export const code = [
  'remove vowels(s):',
  '  output = empty',
  '  for each letter ch in s:',
  '    if ch is not a, e, i, o or u:',
  '      append ch to output',
  '  return output',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def remove_vowels(s):
    output = []
    for ch in s:
        if ch not in 'aeiou':
            output.append(ch)
    return ''.join(output)`

export function buildTrace(input) {
  const { s } = input
  const frames = []
  let output = ''
  const frame = (phase, line, message, snapshot) => frames.push({ phase, activeLine: line, pythonLine: line, message, snapshot })
  frame('start', 2, 'Start with an empty output. Each letter is looked at once, from left to right.', { index: -1, ch: '', kept: null, output, source: s })
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    const kept = !VOWELS.includes(ch)
    frame('inspect', 4, kept ? `${ch} is not a vowel, so it survives.` : `${ch} is a vowel, so it is skipped.`, { index: i, ch, kept, output, source: s })
    if (kept) {
      output += ch
      frame('update', 5, `Append ${ch}. Output is now ${output}.`, { index: i, ch, kept, output, source: s })
    }
  }
  frame('done', 6, output ? `The output is ${output}.` : 'Every letter was a vowel, so the output is empty.', { index: s.length, ch: '', kept: null, output, source: s })
  return { input, result: output, frames }
}
