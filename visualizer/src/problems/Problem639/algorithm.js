const MOD = 1000000007n

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 300 || ![...s].every(c => c === '*' || (c >= '0' && c <= '9'))) throw new Error('Enter a JSON string of 1–300 digits and * characters.')
  return s
}

// ways[i] = decodings of the first i characters. '*' stands for 1–9; '**' has 15 two-character readings.
export function buildTrace(s) {
  const n = s.length
  const ways = Array(n + 1).fill(0n)
  ways[0] = 1n
  const frames = [{ phase: 'start', index: 0, ways: ways.map(String), activeLine: 2, message: 'Empty prefix has one decoding.' }]
  const one = c => (c === '*' ? 9n : (c === '0' ? 0n : 1n))
  const two = (a, b) => {
    if (a === '*' && b === '*') return 15n
    if (a === '*') return b <= '6' ? 2n : 1n
    if (b === '*') return a === '1' ? 9n : a === '2' ? 6n : 0n
    return BigInt(Number(a + b) >= 10 && Number(a + b) <= 26 ? 1 : 0)
  }
  for (let i = 1; i <= n; i++) {
    let v = ways[i - 1] * one(s[i - 1])
    if (i >= 2) v += ways[i - 2] * two(s[i - 2], s[i - 1])
    ways[i] = v % MOD
    frames.push({ phase: 'extend', index: i, ways: ways.map(String), activeLine: 6, message: `Prefix length ${i}: one-digit reading and two-digit reading combined: ${ways[i]}.` })
  }
  const result = Number(ways[n])
  frames.push({ phase: 'done', index: n, ways: ways.map(String), result, activeLine: 9, message: `Total decodings modulo 1e9+7: ${result}.` })
  return { input: s, result, ways, frames }
}

export const code = `set before to 0 and previous to 1, the ways for the empty prefix
for each index i in s:
  count single-symbol readings of s[i]: nine for an asterisk, zero for a zero, otherwise one
  count two-symbol readings of s[i - 1] and s[i] when i is greater than 0
  set current to (single readings times previous plus pair readings times before) modulo 1000000007
  shift: before becomes previous, and previous becomes current
return previous`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Collection trace: codeStage 'decode' is the per-index update (line 5); 'return' is line 7.
const STAGE_LINE = { decode: 5, return: 7 }
export const LINE_MAP = { 1: 1, 4: 5, 5: 7 }

export function familyLine(frame) {
  return STAGE_LINE[frame.codeStage] ?? LINE_MAP[frame.activeLine] ?? frame.activeLine
}

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
