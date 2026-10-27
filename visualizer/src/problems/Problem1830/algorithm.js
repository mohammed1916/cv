const MOD = 1000000007
const MAX_LENGTH = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  const s = data?.s
  if (typeof s !== 'string' || s.length < 1 || s.length > MAX_LENGTH || !/^[a-z]+$/.test(s)) throw new Error(`s must be 1 to ${MAX_LENGTH} lowercase letters.`)
  return { s }
}

const factorial = n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f }

export const code = `min operations to sort(s)
  set counts to how many of each letter remain, starting with all of s
  set rank to 0
  for each position i in s
    for each letter c smaller than s[i] that still has a copy
      add the number of arrangements of the rest after using c to rank
    use up s[i] in counts
  return rank, modulo the prime`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// The operations walk the sorted order backwards, so the count is the number of distinct arrangements that sort before s.
export function buildTrace({ s }) {
  const counts = Array(26).fill(0)
  for (const ch of s) counts[ch.charCodeAt(0) - 97]++
  const arrangements = () => {
    const total = counts.reduce((a, b) => a + b, 0)
    return counts.reduce((acc, c) => acc / factorial(c), factorial(total))
  }
  let rank = 0
  const frames = [{ phase: 'start', index: -1, rank: 0, activeLine: L('set counts'), message: `Count the arrangements of ${s} that come before it.` }]
  for (let i = 0; i < s.length; i++) {
    const idx = s.charCodeAt(i) - 97
    let added = 0
    for (let c = 0; c < idx; c++) {
      if (counts[c] === 0) continue
      counts[c]--
      const ways = arrangements()
      counts[c]++
      added += ways
      rank += ways
    }
    counts[idx]--
    frames.push({ phase: 'position', index: i, rank, activeLine: L('for each letter c smaller'), message: `Position ${i + 1} (${s[i]}): smaller letters can go first in ${added} more arrangement(s); running total ${rank}.` })
  }
  const result = rank % MOD
  frames.push({ phase: 'done', index: s.length - 1, rank: result, activeLine: L('return rank'), result, message: `Operations needed to sort ${s}: ${result}.` })
  return { input: { s }, result, frames }
}

export const python = `def min_operations(s):
    MOD = 1000000007
    from math import factorial
    counts = [0] * 26
    for ch in s:
        counts[ord(ch) - 97] += 1
    rank = 0
    for ch in s:
        idx = ord(ch) - 97
        for c in range(idx):
            if counts[c]:
                counts[c] -= 1
                ways = factorial(sum(counts))
                for x in counts:
                    ways //= factorial(x)
                rank += ways
                counts[c] += 1
        counts[idx] -= 1
    return rank % MOD
`
