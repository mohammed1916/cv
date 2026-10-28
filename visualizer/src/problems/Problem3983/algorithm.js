export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj.s !== 'string' || typeof obj.t !== 'string') throw new Error('Use an object with string fields s and t.')
  const { s, t } = obj
  if (s.length < 1 || s.length > 12 || t.length < 1 || t.length > 16) throw new Error('Use s with 1 to 12 letters and t with 1 to 16 letters.')
  if (!/^[a-z]+$/.test(s) || !/^[a-z]+$/.test(t)) throw new Error('Both strings must use lowercase letters a to z only.')
  return { s, t }
}

export function buildTrace(input) {
  const { s, t } = input
  const n = s.length
  const m = t.length
  const inf = m + 1
  const frames = []
  const prefix = [0]
  for (let i = 0; i < n; i++) {
    let p = prefix[i]
    while (p < m && t[p] !== s[i]) p++
    prefix.push(p < m ? p + 1 : inf)
    frames.push({ phase: 'prefix', activeLine: L('prefixEnd[i+1]'), i, prefix: prefix.slice(), suffix: null, found: null, message: `Greedy match of s[${i}] = ${s[i]} ends the prefix at ${p < m ? p + 1 : 'never'}.` })
  }
  const suffix = Array(n + 1).fill(m)
  for (let j = n - 1; j >= 0; j--) {
    let p = suffix[j + 1] - 1
    while (p >= 0 && t[p] !== s[j]) p--
    suffix[j] = p >= 0 ? p : -1
    frames.push({ phase: 'suffix', activeLine: L('suffixStart[j]'), i: j, prefix: prefix.slice(), suffix: suffix.slice(), found: null, message: `Suffix from s[${j}] can start no later than ${suffix[j] < 0 ? 'never' : suffix[j]}.` })
  }
  if (prefix[n] <= m) {
    frames.push({ phase: 'done', activeLine: L('if prefixEnd[n]'), i: -1, prefix: prefix.slice(), suffix: suffix.slice(), found: true, message: 's already fits in t, so no replacement is needed.' })
    return { input, result: true, frames }
  }
  for (let i = 0; i < n; i++) {
    const fits = prefix[i] < suffix[i + 1]
    frames.push({ phase: 'try', activeLine: L('if prefixEnd[i] is less'), i, prefix: prefix.slice(), suffix: suffix.slice(), found: fits, message: fits ? `Replacing s[${i}] works: some letter of t lies between the two parts.` : `Replacing s[${i}] does not fit.` })
    if (fits) {
      frames.push({ phase: 'done', activeLine: L('return true'), i, prefix: prefix.slice(), suffix: suffix.slice(), found: true, message: 'One replacement makes s a subsequence of t.' })
      return { input, result: true, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return false'), i: -1, prefix: prefix.slice(), suffix: suffix.slice(), found: false, message: 'No single replacement works.' })
  return { input, result: false, frames }
}

export const code = `can s become a subsequence of t after one replacement(s, t)
  set n to the length of s and m to the length of t
  for i from 0 to n-1 compute prefixEnd[i+1] as the first match of s[i] after prefixEnd[i]
  for j from n-1 down to 0 compute suffixStart[j] as the last match of s[j] before suffixStart[j+1]
  if prefixEnd[n] is at most m then return true
  for each position i in s do
    if prefixEnd[i] is less than suffixStart[i+1] then return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_match_after_one_replacement(s, t):
    n = len(s)
    m = len(t)
    inf = m + 1
    prefix_end = [0] * (n + 1)
    for i in range(n):
        p = prefix_end[i]
        while p < m and t[p] != s[i]:
            p += 1
        prefix_end[i + 1] = p + 1 if p < m else inf
    suffix_start = [m] * (n + 1)
    for j in range(n - 1, -1, -1):
        p = suffix_start[j + 1] - 1
        while p >= 0 and t[p] != s[j]:
            p -= 1
        suffix_start[j] = p if p >= 0 else -1
    if prefix_end[n] <= m:
        return True
    for i in range(n):
        if prefix_end[i] < suffix_start[i + 1]:
            return True
    return False
`
