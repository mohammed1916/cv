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

export const code = `def numDecodings(s):
    MOD = 10**9 + 7
    prev2, prev1 = 1, ways_one(s[0])
    for i in range(1, len(s)):
        cur = prev1 * ways_one(s[i]) + prev2 * ways_two(s[i-1], s[i])
        prev2, prev1 = prev1, cur % MOD
    return prev1`.split('\n').map((text, index) => ({ line: index + 1, text }))
