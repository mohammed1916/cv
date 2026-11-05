export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 100 || ![...s].every(c => c >= ' ' && c <= '~')) throw new Error('Enter a JSON string of 1–100 printable ASCII characters.')
  return s
}

const JS_LINES = [
  'function toLowerCase(s) {',
  '  let out = \'\'',
  '  for (let i = 0; i < s.length; i++) {',
  '    const code = s.charCodeAt(i)',
  '    if (code >= 65 && code <= 90) out += String.fromCharCode(code + 32) // A–Z move 32 code units up',
  '    else out += s[i] // everything else is unchanged',
  '  }',
  '  return out',
  '}',
]
const PY_LINES = [
  'def to_lower_case(s):',
  '    out = []',
  '    for ch in s:',
  '        code = ord(ch)',
  '        if 65 <= code <= 90:',
  '            out.append(chr(code + 32))',
  '        else:',
  '            out.append(ch)',
  '    return \'\'.join(out)',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Each uppercase letter (A–Z, codes 65–90) moves 32 code units up; everything else is unchanged.
export function buildTrace(s) {
  let out = ''
  const frames = [{ phase: 'start', index: -1, out: '', activeLine: L("let out = ''"), pythonLine: P('out = []'), message: 'Shift each uppercase letter by 32 code units.' }]
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i)
    const upper = code >= 65 && code <= 90
    const piece = upper ? String.fromCharCode(code + 32) : s[i]
    out += piece
    frames.push({ phase: upper ? 'shift' : 'keep', index: i, from: s[i], to: piece, out, activeLine: L(upper ? 'A–Z move' : 'everything else'), pythonLine: P(upper ? 'chr(code + 32)' : 'out.append(ch)'),
      message: upper ? `${s[i]} (${code}) becomes ${piece} (${code + 32}).` : `${s[i]} is not an uppercase letter, so it stays.` })
  }
  frames.push({ phase: 'done', index: s.length - 1, out, result: out, activeLine: L('return out'), pythonLine: P("return ''.join"), message: `Lowercase: ${out}` })
  return { input: s, result: out, frames }
}
