export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string' || !Number.isInteger(input.k)) throw new Error('Use an object with a lowercase string s and an integer k.')
  if (input.s.length < 1 || input.s.length > 30) throw new Error('s must have 1 to 30 characters.')
  if (!/^[a-z]+$/.test(input.s)) throw new Error('s may only contain lowercase letters a to z.')
  if (input.k < 1 || input.k > input.s.length) throw new Error('k must be from 1 up to the length of s.')
  return { s: input.s, k: input.k }
}

export function buildTrace({ s, k }) {
  const n = s.length
  const pal = Array.from({ length: n }, () => new Array(n).fill(false))
  for (let length = 1; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1
      pal[i][j] = s[i] === s[j] && (length <= 2 || pal[i + 1][j - 1])
    }
  }
  const best = new Array(n + 1).fill(0)
  const frames = []
  frames.push({ phase: 'table', activeLine: L('mark each substring'), end: 0, start: null, best: [...best], message: 'Palindromes are marked for every substring.' })
  for (let end = 1; end <= n; end++) {
    best[end] = best[end - 1]
    frames.push({ phase: 'end', activeLine: L('set best at end to the best value'), end, start: null, best: [...best], message: `Best count for the first ${end} characters starts at ${best[end]}.` })
    for (let start = 0; start <= end - k; start++) {
      if (!pal[start][end - 1]) continue
      const candidate = best[start] + 1
      if (candidate > best[end]) best[end] = candidate
      frames.push({ phase: 'check', activeLine: L('if s from start'), end, start, best: [...best], message: `s[${start}..${end - 1}] is a palindrome of length ${end - start} >= ${k}. Using it gives ${candidate}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best at n'), end: n, start: null, best: [...best], message: `Maximum number of non-overlapping palindromes: ${best[n]}.` })
  return { input: { s, k }, result: best[n], frames }
}

export const code = `maximum non-overlapping palindromes (s, k):
  set n to the length of s
  mark each substring s[i..j] as a palindrome when its ends match and the inside is one
  set best to n plus 1 zeros
  for each end from 1 to n
    set best at end to the best value at end minus 1
    for each start from 0 to end minus k
      if s from start to end minus 1 is a palindrome then set best at end to the larger of best at end and best at start plus 1
  return best at n`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_palindromes(s, k):
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    for length in range(1, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            pal[i][j] = s[i] == s[j] and (length <= 2 or pal[i + 1][j - 1])
    best = [0] * (n + 1)
    for end in range(1, n + 1):
        best[end] = best[end - 1]
        for start in range(0, end - k + 1):
            if pal[start][end - 1]:
                best[end] = max(best[end], best[start] + 1)
    return best[n]
`
