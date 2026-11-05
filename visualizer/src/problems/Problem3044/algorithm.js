export function parseInput(text) {
  const mat = JSON.parse(text)
  if (!Array.isArray(mat) || mat.length < 1 || mat.length > 4 || !mat.every(row => Array.isArray(row) && row.length >= 1 && row.length <= 4 && row.length === mat[0].length && row.every(v => Number.isInteger(v) && v >= 0 && v <= 9))) throw new Error('Use a JSON matrix of up to 4 by 4 digits.')
  return mat
}

const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
const isPrime = x => {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export function buildTrace(mat) {
  const frames = []
  const m = mat.length
  const n = mat[0].length
  const freq = new Map()
  frames.push({ pythonLine: 12, phase: 'start', activeLine: L('for (let r = 0'), cell: null, dir: null, num: null, best: -1, bestCount: 0, message: `Read digit runs from each of the ${m * n} cells.` })
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      for (const [dr, dc] of DIRS) {
        let num = 0
        let nr = r
        let nc = c
        while (nr >= 0 && nr < m && nc >= 0 && nc < n) {
          num = num * 10 + mat[nr][nc]
          if (num > 10 && isPrime(num)) {
            freq.set(num, (freq.get(num) ?? 0) + 1)
            frames.push({ pythonLine: 23, phase: 'prime', activeLine: L('if (num > 10 && isPrime(num))'), cell: [r, c], dir: [dr, dc], num, best: null, bestCount: freq.get(num), message: `${num} is a prime above ten; seen ${freq.get(num)} time${freq.get(num) === 1 ? '' : 's'}.` })
          }
          nr += dr
          nc += dc
        }
      }
    }
  }
  let best = -1
  let bestCount = 0
  for (const [num, count] of freq) {
    if (count > bestCount || (count === bestCount && num > best)) { best = num; bestCount = count }
  }
  frames.push({ pythonLine: 30, phase: 'done', activeLine: L('return best'), cell: null, dir: null, num: null, best, bestCount, message: best === -1 ? 'No prime above ten was formed.' : `${best} is the most frequent prime above ten.` })
  return { input: mat, result: best, frames }
}

export const code = `function mostFrequentPrime(mat) {
  const m = mat.length
  const n = mat[0].length
  const freq = new Map()
  const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      for (const [dr, dc] of dirs) {
        let num = 0
        let nr = r
        let nc = c
        while (nr >= 0 && nr < m && nc >= 0 && nc < n) {
          num = num * 10 + mat[nr][nc]
          if (num > 10 && isPrime(num)) freq.set(num, (freq.get(num) ?? 0) + 1)
          nr += dr
          nc += dc
        }
      }
    }
  }
  let best = -1
  let bestCount = 0
  for (const [num, count] of freq) {
    if (count > bestCount || (count === bestCount && num > best)) { best = num; bestCount = count }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def is_prime(x):
    if x < 2:
        return False
    d = 2
    while d * d <= x:
        if x % d == 0:
            return False
        d += 1
    return True

def most_frequent_prime(mat):
    m, n = len(mat), len(mat[0])
    freq = {}
    dirs = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    for r in range(m):
        for c in range(n):
            for dr, dc in dirs:
                num = 0
                nr, nc = r, c
                while 0 <= nr < m and 0 <= nc < n:
                    num = num * 10 + mat[nr][nc]
                    if num > 10 and is_prime(num):
                        freq[num] = freq.get(num, 0) + 1
                    nr += dr
                    nc += dc
    best, best_count = -1, 0
    for num, count in freq.items():
        if count > best_count or (count == best_count and num > best):
            best, best_count = num, count
    return best
`
