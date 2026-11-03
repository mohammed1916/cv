const MOD = 1000000007n

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 60 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 60 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > 26) throw new Error('k is an integer from 1 to 26.')
  return { s, k }
}

// Each distinct letter with frequency f can supply f choices of index. Taking the k
// largest frequencies maximizes beauty. Letters tied with the k-th frequency v are
// interchangeable, so choose the needed number of them and multiply by v per choice.
export function countMaxBeauty(s, k) {
  const freq = new Map()
  for (const c of s) freq.set(c, (freq.get(c) || 0) + 1)
  if (freq.size < k) return 0n
  const ranked = [...freq.values()].sort((a, b) => b - a)
  const v = ranked[k - 1]
  const above = ranked.filter(f => f > v)
  const tied = ranked.filter(f => f === v).length
  const need = k - above.length
  let ways = binomial(tied, need)
  for (const f of above) ways = (ways * BigInt(f)) % MOD
  for (let i = 0; i < need; i++) ways = (ways * BigInt(v)) % MOD
  return ways
}

function binomial(n, r) {
  let result = 1n
  for (let i = 0; i < r; i++) result = (result * BigInt(n - i)) / BigInt(i + 1)
  return result % MOD
}

export function buildTrace({ s, k }) {
  const freq = new Map()
  for (const c of s) freq.set(c, (freq.get(c) || 0) + 1)
  const frames = []
  const letters = [...freq.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
  frames.push({ pythonLine: 3, phase: 'count', activeLine: L('count how often'), chosen: [], message: `Counts: ${letters.map(([c, f]) => `${c}=${f}`).join(', ')}.` })
  if (freq.size < k) {
    frames.push({ pythonLine: 4, phase: 'done', activeLine: L('return 0'), chosen: [], message: `Only ${freq.size} distinct letters, so no ${k}-subsequence exists.` })
    return { input: { s, k }, result: '0', frames }
  }
  const chosen = letters.slice(0, k)
  frames.push({ pythonLine: 6, phase: 'rank', activeLine: L('take the k largest'), chosen: chosen.map(([c]) => c), message: `The top ${k} letters by frequency give the largest beauty.` })
  const v = chosen[k - 1][1]
  const tiedAll = letters.filter(([, f]) => f === v)
  frames.push({ pythonLine: 8, phase: 'tie', activeLine: L('letters tied with the k-th'), chosen: chosen.map(([c]) => c), message: `${tiedAll.length} letter${tiedAll.length === 1 ? '' : 's'} share frequency ${v}; any of them can fill the last slots.` })
  const result = countMaxBeauty(s, k).toString()
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return the product'), chosen: chosen.map(([c]) => c), message: `Choose which tied letters to use, then one index for each: ${result} ways.` })
  return { input: { s, k }, result, frames }
}

export const code = `count the maximum beauty subsequences of s with k distinct letters
  count how often each letter appears
  sort the letters by frequency from high to low
  take the k largest; the k-th frequency is v
  count the tied letters with frequency v and how many slots they fill
  return the number of ways to pick those letters and one index each, modulo 1e9+7`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import comb

def count_max_beauty(s, k):
    MOD = 10**9 + 7
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    if len(freq) < k:
        return 0
    ranked = sorted(freq.values(), reverse=True)
    v = ranked[k - 1]
    above = [f for f in ranked if f > v]
    tied = sum(1 for f in ranked if f == v)
    need = k - len(above)
    ways = comb(tied, need) % MOD
    for f in above:
        ways = ways * f % MOD
    return ways * pow(v, need, MOD) % MOD
`
