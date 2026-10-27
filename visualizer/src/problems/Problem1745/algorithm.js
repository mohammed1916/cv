export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string') throw new Error('Use an object with a string s.')
  if (input.s.length < 3 || input.s.length > 30) throw new Error('s must have 3 to 30 characters.')
  if (!/^[a-z]+$/.test(input.s)) throw new Error('s may only contain lowercase letters a to z.')
  return { s: input.s }
}

export function buildTrace({ s }) {
  const n = s.length
  const pal = Array.from({ length: n }, () => new Array(n).fill(false))
  for (let length = 1; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1
      pal[i][j] = s[i] === s[j] && (length <= 2 || pal[i + 1][j - 1])
    }
  }
  const frames = []
  frames.push({ phase: 'table', activeLine: L('mark each substring'), a: null, b: null, found: false, message: 'The palindrome table is filled for every substring.' })
  let result = false
  search: for (let a = 1; a <= n - 2; a++) {
    for (let b = a + 1; b <= n - 1; b++) {
      const ok = pal[0][a - 1] && pal[a][b - 1] && pal[b][n - 1]
      frames.push({ phase: 'cut', activeLine: L('for each second cut'), a, b, found: ok, message: ok ? `Cuts at ${a} and ${b} give three palindromes.` : `Cuts at ${a} and ${b}: at least one piece is not a palindrome.` })
      if (ok) {
        result = true
        frames.push({ phase: 'done', activeLine: L('return true'), a, b, found: true, message: `Partition found: ${s.slice(0, a)} | ${s.slice(a, b)} | ${s.slice(b)}.` })
        break search
      }
    }
  }
  if (!result) frames.push({ phase: 'done', activeLine: L('return false'), a: null, b: null, found: false, message: 'Every pair of cuts fails, so no split into three palindromes exists.' })
  return { input: { s }, result, frames }
}

export const code = `check partitioning (s):
  set n to the length of s
  mark each substring s[i..j] as a palindrome when its ends match and the inside is one
  for each first cut a from 1 to n minus 2
    for each second cut b from a plus 1 to n minus 1
      if the three pieces are all palindromes then return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def check_partitioning(s):
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    for length in range(1, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            pal[i][j] = s[i] == s[j] and (length <= 2 or pal[i + 1][j - 1])
    for a in range(1, n - 1):
        for b in range(a + 1, n):
            if pal[0][a - 1] and pal[a][b - 1] and pal[b][n - 1]:
                return True
    return False
`
