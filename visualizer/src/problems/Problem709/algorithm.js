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

export const code = `def toLowerCase(s):
    out = []
    for ch in s:
        if 'A' <= ch <= 'Z': out.append(chr(ord(ch) + 32))
        else: out.append(ch)
    return ''.join(out)`.split('\n').map((text, index) => ({ line: index + 1, text }))
