const MOD = 1000003
const BASE = 27

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 20) throw new Error('Use a JSON string of 1 to 20 lowercase letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use only lowercase letters a to z.')
  return s
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function distinctEchoSubstrings(text) {', 'def distinct_echo_substrings(text):'],
  ['  const n = text.length', '    n = len(text)'],
  ['  const pref = [0]', '    pref = [0] * (n + 1)'],
  ['  const pw = [1]', '    pw = [1] * (n + 1)'],
  ['  for (let i = 0; i < n; i++) {', '    for i, ch in enumerate(text):'],
  ['    pref.push((pref[i] * BASE + text.charCodeAt(i) - 96) % MOD)', '        pref[i + 1] = (pref[i] * BASE + ord(ch) - 96) % MOD'],
  ['    pw.push((pw[i] * BASE) % MOD)', '        pw[i + 1] = pw[i] * BASE % MOD'],
  ['  }', ''],
  ['  const hashAt = (i, len) => (pref[i + len] - ((pref[i] * pw[len]) % MOD) + MOD) % MOD', '    def h(i, length):'],
  ['  // hashAt returns the hash of the window that starts at i', '        return (pref[i + length] - pref[i] * pw[length]) % MOD'],
  ['  const seen = new Set()', '    seen = set()'],
  ['  for (let len = 1; len <= Math.floor(n / 2); len++) {', '    for length in range(1, n // 2 + 1):'],
  ['    for (let i = 0; i + 2 * len <= n; i++) {', '        for i in range(n - 2 * length + 1):'],
  ['      if (hashAt(i, len) === hashAt(i + len, len) && text.slice(i, i + len) === text.slice(i + len, i + 2 * len))', '            if h(i, length) == h(i + length, length) and text[i:i + length] == text[i + length:i + 2 * length]:'],
  ['        seen.add(text.slice(i, i + len))', '                seen.add(text[i:i + length])'],
  ['    }', ''],
  ['  }', ''],
  ['  return seen.size', '    return len(seen)'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(text) {
  const n = text.length
  const pref = [0]
  const pw = [1]
  for (let i = 0; i < n; i++) {
    pref.push((pref[i] * BASE + text.charCodeAt(i) - 96) % MOD)
    pw.push((pw[i] * BASE) % MOD)
  }
  const hashAt = (i, len) => (pref[i + len] - ((pref[i] * pw[len]) % MOD) + MOD) % MOD
  const seen = new Set()
  const frames = [{ phase: 'start', activeLine: L('const pref = [0]'), pythonLine: P('seen = set()'), len: 0, start: -1, count: 0, message: 'Start with no echoes found.' }]
  for (let len = 1; len <= Math.floor(n / 2); len++) {
    for (let i = 0; i + 2 * len <= n; i++) {
      const sameHash = hashAt(i, len) === hashAt(i + len, len)
      if (sameHash && text.slice(i, i + len) === text.slice(i + len, i + 2 * len)) seen.add(text.slice(i, i + len))
    }
    frames.push({ phase: 'length', activeLine: L('for (let len = 1'), pythonLine: P('for length in range'), len, start: -1, count: seen.size, message: `Half-length ${len}: ${seen.size} distinct echoes so far.` })
  }
  frames.push({ phase: 'done', activeLine: L('return seen.size'), pythonLine: P('return len(seen)'), len: Math.floor(n / 2), start: -1, count: seen.size, message: `Distinct echo substrings: ${seen.size}.` })
  return { input: text, result: seen.size, frames }
}
