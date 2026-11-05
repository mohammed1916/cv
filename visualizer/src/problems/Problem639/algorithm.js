const MOD = 1000000007

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 300 || ![...s].every(c => c === '*' || (c >= '0' && c <= '9'))) throw new Error('Enter a JSON string of 1–300 digits and * characters.')
  return s
}

// ways[i] = decodings of the first i characters. A '*' stands for 1–9, and a '**' pair has 15 readings.
export function buildTrace(s) {
  const n = s.length
  const ways = Array(n + 1).fill(0)
  ways[0] = 1
  const frames = [{ phase: 'start', index: 0, ways: [...ways], chars: [...s], activeLine: L('let before = 0'), pythonLine: P('before, previous = 0, 1'), message: 'The empty prefix has exactly one decoding.' }]
  const single = c => (c === '*' ? 9 : c === '0' ? 0 : 1)
  const pair = (a, b) => {
    if (a === '*' && b === '*') return 15
    if (a === '*') return Number(b) <= 6 ? 2 : 1
    if (b === '*') return a === '1' ? 9 : a === '2' ? 6 : 0
    const v = Number(a + b)
    return v >= 10 && v <= 26 ? 1 : 0
  }
  for (let i = 1; i <= n; i++) {
    const two = i >= 2 ? pair(s[i - 2], s[i - 1]) : 0
    const current = (single(s[i - 1]) * ways[i - 1] + two * (i >= 2 ? ways[i - 2] : 0)) % MOD
    ways[i] = current
    frames.push({ phase: 'extend', index: i, ways: [...ways], chars: [...s], one: single(s[i - 1]), two, activeLine: L('const current'), pythonLine: P('current = (single'), message: `Prefix length ${i}: ${single(s[i - 1])} one-character reading(s) and ${two} two-character reading(s) give ${current}.` })
  }
  const result = ways[n]
  frames.push({ phase: 'done', index: n, ways: [...ways], chars: [...s], result, activeLine: L('return previous'), pythonLine: P('return previous'), message: `Total decodings modulo 1e9+7: ${result}.` })
  return { input: s, result, ways, frames }
}

const SOURCE = `function numDecodings(s) {
  const MOD = 1000000007
  const single = c => (c === '*' ? 9 : c === '0' ? 0 : 1)
  const pair = (a, b) => {
    if (a === '*' && b === '*') return 15
    if (a === '*') return Number(b) <= 6 ? 2 : 1
    if (b === '*') return a === '1' ? 9 : a === '2' ? 6 : 0
    const v = Number(a + b)
    return v >= 10 && v <= 26 ? 1 : 0
  }
  let before = 0
  let previous = 1
  for (let i = 0; i < s.length; i++) {
    const two = i > 0 ? pair(s[i - 1], s[i]) : 0
    const current = (single(s[i]) * previous + two * before) % MOD
    before = previous
    previous = current
  }
  return previous
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_decodings(s):
    def single(c):
        if c == '*':
            return 9
        return 0 if c == '0' else 1

    def pair(a, b):
        if a == '*' and b == '*':
            return 15
        if a == '*':
            return 2 if int(b) <= 6 else 1
        if b == '*':
            return 9 if a == '1' else 6 if a == '2' else 0
        return 1 if 10 <= int(a + b) <= 26 else 0

    modulus = 1000000007
    before, previous = 0, 1
    for i, character in enumerate(s):
        two = pair(s[i - 1], character) if i > 0 else 0
        current = (single(character) * previous + two * before) % modulus
        before, previous = previous, current
    return previous`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
