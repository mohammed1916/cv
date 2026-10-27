export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 100 || ![...s].every(c => c >= ' ' && c <= '~')) throw new Error('Enter a JSON string of 1–100 printable ASCII characters.')
  return s
}

// Each uppercase letter (A–Z, codes 65–90) moves 32 code units up; everything else is unchanged.
export function buildTrace(s) {
  const out = []
  const frames = [{ phase: 'start', index: -1, out: '', activeLine: 2, message: 'Shift each uppercase letter by 32 code units.' }]
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i)
    const upper = code >= 65 && code <= 90
    out.push(upper ? String.fromCharCode(code + 32) : s[i])
    frames.push({ phase: upper ? 'shift' : 'keep', index: i, from: s[i], to: out[i], out: out.join(''), activeLine: upper ? 5 : 6, message: upper ? `${s[i]} (${code}) → ${out[i]} (${code + 32}).` : `${s[i]} is not an uppercase letter; keep it.` })
  }
  const result = out.join('')
  frames.push({ phase: 'done', index: s.length - 1, out: result, result, activeLine: 8, message: `Lowercase: ${result}` })
  return { input: s, result, frames }
}

export const code = `create an empty output list
for each character c in s
  if the ASCII code of c is between 65 and 90, append the character with its code increased by 32
  otherwise append c unchanged
return the output joined into one string`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 4 both shifts uppercase letters and keeps other characters, so it maps to line 3 or 4 by message.
export function familyLine(frame) {
  if (frame.activeLine === 4) return /shift by 32/.test(frame.message) ? 3 : 4
  return ({ 1: 1, 2: 2, 3: 3, 5: 5 })[frame.activeLine] ?? frame.activeLine
}

export const python = `def to_lower_case(s):
    output = []
    for ch in s:
        code = ord(ch)
        if 65 <= code <= 90:
            output.append(chr(code + 32))
        else:
            output.append(ch)
    return ''.join(output)`
