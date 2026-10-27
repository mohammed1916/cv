const cyclic = (a, b) => {
  const d = Math.abs(a.charCodeAt(0) - b.charCodeAt(0))
  return Math.min(d, 26 - d)
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s and k.')
  const { s, k } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 12 || !/^[a-z]+$/.test(s)) throw new Error('s is 1 to 12 lowercase letters.')
  if (!Number.isInteger(k) || k < 0 || k > 30) throw new Error('k is an integer from 0 to 30.')
  return { s, k }
}

export function buildTrace(input) {
  const { s, k } = input
  const n = s.length
  // best[i][j][c]: longest palindromic subsequence of s[i..j] using at most c operations.
  const best = Array.from({ length: n }, () => Array.from({ length: n }, () => new Array(k + 1).fill(0)))
  const at = (i, j, c) => (i > j ? 0 : best[i][j][c])
  const computed = new Set()
  const table = () => best.map((row, i) => row.map((cells, j) => (computed.has(`${i}:${j}`) ? cells[k] : '·')))
  const frames = [{ phase: 'start', activeLine: L('let best[i][j][c]'), i: -1, j: -1, table: table(), message: `Start with the whole string ${s} and a budget of ${k} operations.` }]
  for (let length = 1; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1
      for (let c = 0; c <= k; c++) {
        if (length === 1) {
          best[i][j][c] = 1
          continue
        }
        let v = Math.max(at(i + 1, j, c), at(i, j - 1, c))
        const w = cyclic(s[i], s[j])
        if (w <= c) v = Math.max(v, 2 + at(i + 1, j - 1, c - w))
        best[i][j][c] = v
      }
      computed.add(`${i}:${j}`)
      const w = length === 1 ? 0 : cyclic(s[i], s[j])
      frames.push({ phase: 'cell', activeLine: L('if the interval holds'), i, j, table: table(),
        message: length === 1 ? `Interval ${s[i]} holds one letter, so its palindrome has length 1.`
          : `Interval ${s.slice(i, j + 1)} with ends ${s[i]} and ${s[j]} costs ${w} to match. Best with budget ${k}: ${best[i][j][k]}.` })
    }
  }
  const result = best[0][n - 1][k]
  frames.push({ phase: 'done', activeLine: L('return best of the whole'), i: -1, j: -1, table: table(), message: `The longest palindrome after at most ${k} operations has length ${result}.` })
  return { input, result, frames }
}

export const code = `longest palindrome after at most k operations
  let best[i][j][c] be the longest palindrome inside s from i to j using at most c operations
  for each interval from length 1 up to the whole string
    for each budget c from 0 to k
      if the interval holds one letter then best is 1
      otherwise take the larger of dropping the first letter and dropping the last letter
      if the two ends cost w operations or fewer to match then consider 2 plus best of the inner interval with c minus w
  return best of the whole string with budget k`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_palindromic_after_ops(s, k):
    n = len(s)

    def cost(a, b):
        d = abs(ord(a) - ord(b))
        return min(d, 26 - d)

    best = [[[0] * (k + 1) for _ in range(n)] for _ in range(n)]

    def at(i, j, c):
        return 0 if i > j else best[i][j][c]

    for length in range(1, n + 1):
        for i in range(0, n - length + 1):
            j = i + length - 1
            for c in range(k + 1):
                if length == 1:
                    best[i][j][c] = 1
                    continue
                v = max(at(i + 1, j, c), at(i, j - 1, c))
                w = cost(s[i], s[j])
                if w <= c:
                    v = max(v, 2 + at(i + 1, j - 1, c - w))
                best[i][j][c] = v
    return best[0][n - 1][k]
`
