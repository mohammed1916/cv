const MOD = 1000003
const BASE = 27

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 20) throw new Error('Use a JSON string of 1 to 20 lowercase letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use only lowercase letters a to z.')
  return s
}

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
  const frames = [{ phase: 'start', activeLine: L('build prefix'), len: 0, start: -1, count: 0, message: 'Start with no echoes found.' }]
  for (let len = 1; len <= Math.floor(n / 2); len++) {
    for (let i = 0; i + 2 * len <= n; i++) {
      const sameHash = hashAt(i, len) === hashAt(i + len, len)
      if (sameHash && text.slice(i, i + len) === text.slice(i + len, i + 2 * len)) seen.add(text.slice(i, i + len))
    }
    frames.push({ phase: 'length', activeLine: L('for each length'), len, start: -1, count: seen.size, message: `Half-length ${len}: ${seen.size} distinct echoes so far.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the number'), len: Math.floor(n / 2), start: -1, count: seen.size, message: `Distinct echo substrings: ${seen.size}.` })
  return { input: text, result: seen.size, frames }
}

export const code = `count distinct substrings that are an echo, meaning a + a
build prefix hashes of text and powers of the base
set seen to an empty set
for each length L from 1 to n / 2 do
  for each start i with i + 2L at most n do
    compare the hashes of the two halves, then the halves themselves
    if they match then add the first half to seen
return the number of distinct echoes in seen`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def distinct_echo_substrings(text):
    MOD = 1000003
    BASE = 27
    n = len(text)
    pref = [0] * (n + 1)
    pw = [1] * (n + 1)
    for i, ch in enumerate(text):
        pref[i + 1] = (pref[i] * BASE + ord(ch) - 96) % MOD
        pw[i + 1] = pw[i] * BASE % MOD

    def h(i, length):
        return (pref[i + length] - pref[i] * pw[length]) % MOD

    seen = set()
    for length in range(1, n // 2 + 1):
        for i in range(n - 2 * length + 1):
            if h(i, length) == h(i + length, length) and text[i:i + length] == text[i + length:i + 2 * length]:
                seen.add(text[i:i + length])
    return len(seen)
`
