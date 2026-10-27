const MAX_LENGTH = 10

export function parseInput(text) {
  const data = JSON.parse(text)
  const s = data?.s
  if (typeof s !== 'string' || s.length < 1 || s.length > MAX_LENGTH || !/^[a-z]+$/.test(s)) throw new Error(`s must be 1 to ${MAX_LENGTH} lowercase letters.`)
  return { s }
}

export const code = `min insertions(s)
  set best[i][i] to 0 for every single letter
  for each substring length from 2 to n
    for each start i, with end j = i + length - 1
      if s[i] equals s[j] then best[i][j] = best of the inside, zero when empty
      otherwise best[i][j] = 1 + the smaller of best[i+1][j] and best[i][j-1]
  return best[0][n-1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// A substring whose ends match needs only its inside made palindromic; otherwise one end must gain a mirror letter.
export function buildTrace({ s }) {
  const n = s.length
  const best = Array.from({ length: n }, () => Array(n).fill(0))
  const done = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j))
  const show = () => best.map((row, i) => row.map((v, j) => (done[i][j] ? v : '–')))
  const frames = [{ phase: 'start', cell: null, table: show(), activeLine: L('set best[i][i]'), message: 'A single letter is already a palindrome.' }]
  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1
      if (s[i] === s[j]) {
        best[i][j] = i + 1 <= j - 1 ? best[i + 1][j - 1] : 0
        done[i][j] = true
        frames.push({ phase: 'match', cell: [i, j], table: show(), activeLine: L('if s[i] equals'), message: `Ends "${s[i]}" and "${s[j]}" match, so the inside of "${s.slice(i, j + 1)}" decides: ${best[i][j]}.` })
      } else {
        best[i][j] = 1 + Math.min(best[i + 1][j], best[i][j - 1])
        done[i][j] = true
        frames.push({ phase: 'differ', cell: [i, j], table: show(), activeLine: L('otherwise best'), message: `Ends "${s[i]}" and "${s[j]}" differ, so one insertion is needed: ${best[i][j]}.` })
      }
    }
  }
  const result = best[0][n - 1]
  frames.push({ phase: 'done', cell: [0, n - 1], table: show(), activeLine: L('return best[0][n-1]'), result, message: `Minimum insertions for "${s}": ${result}.` })
  return { input: { s }, result, frames }
}

export const python = `def min_insertions(s):
    n = len(s)
    best = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(0, n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                best[i][j] = best[i + 1][j - 1] if i + 1 <= j - 1 else 0
            else:
                best[i][j] = 1 + min(best[i + 1][j], best[i][j - 1])
    return best[0][n - 1]
`
