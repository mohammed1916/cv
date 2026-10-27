const MAX_LENGTH = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  const { s, k } = data ?? {}
  if (typeof s !== 'string' || s.length < 1 || s.length > MAX_LENGTH || !/^[a-z]+$/.test(s)) throw new Error(`s must be 1 to ${MAX_LENGTH} lowercase letters.`)
  if (!Number.isInteger(k) || k < 1 || k > s.length) throw new Error('k must be an integer from 1 to the length of s.')
  return { s, k }
}

export const code = `min changes to palindromes(s, k)
  for each substring from i to j
    set cost[i][j] to the letter changes that make it a palindrome
  set best[0][0] to 0 and best[0][e] to infinity for e above 0
  for each number of parts p from 1 to k
    for each prefix length e from p to n
      for each split q where p-1 parts cover the first q letters
        keep the smallest best[p-1][q] + cost[q][e-1] in best[p][e]
  return best[k][n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Each part is charged the letter changes it needs, and the split points come from a layered table.
export function buildTrace({ s, k }) {
  const n = s.length
  const INF = Infinity
  const cost = Array.from({ length: n }, () => Array(n).fill(0))
  const frames = [{ phase: 'start', range: null, cell: null, table: null, activeLine: L('for each substring'), message: 'Price every substring by the letter changes that make it a palindrome.' }]
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let changes = 0
      for (let a = i, b = j; a < b; a++, b--) if (s[a] !== s[b]) changes++
      cost[i][j] = changes
      frames.push({ phase: 'cost', range: [i, j], cell: null, table: null, activeLine: L('set cost[i][j]'), message: `"${s.slice(i, j + 1)}" needs ${changes} letter change(s) to become a palindrome.` })
    }
  }
  const best = Array.from({ length: k + 1 }, () => Array(n + 1).fill(INF))
  best[0][0] = 0
  const snapshot = () => best.map(row => row.map(v => (v === INF ? '∞' : v)))
  frames.push({ phase: 'base', range: null, cell: null, table: snapshot(), activeLine: L('set best[0][0]'), message: 'Zero parts cover zero letters at no cost.' })
  for (let p = 1; p <= k; p++) {
    for (let e = p; e <= n; e++) {
      for (let q = p - 1; q < e; q++) {
        if (best[p - 1][q] === INF) continue
        const candidate = best[p - 1][q] + cost[q][e - 1]
        if (candidate < best[p][e]) best[p][e] = candidate
      }
      frames.push({ phase: 'cell', range: null, cell: [p, e], table: snapshot(), activeLine: L('keep the smallest'), message: `${p} part(s) cover the first ${e} letters with at most ${best[p][e] === INF ? '∞' : best[p][e]} change(s).` })
    }
  }
  const result = best[k][n]
  frames.push({ phase: 'done', range: null, cell: [k, n], table: snapshot(), activeLine: L('return best[k][n]'), result, message: `Minimum changes with ${k} palindromes: ${result}.` })
  return { input: { s, k }, result, frames }
}

export const python = `def min_changes_to_palindromes(s, k):
    n = len(s)
    INF = float('inf')
    cost = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i, n):
            a, b = i, j
            changes = 0
            while a < b:
                if s[a] != s[b]:
                    changes += 1
                a += 1
                b -= 1
            cost[i][j] = changes
    best = [[INF] * (n + 1) for _ in range(k + 1)]
    best[0][0] = 0
    for p in range(1, k + 1):
        for e in range(p, n + 1):
            for q in range(p - 1, e):
                if best[p - 1][q] < INF:
                    candidate = best[p - 1][q] + cost[q][e - 1]
                    if candidate < best[p][e]:
                        best[p][e] = candidate
    return best[k][n]
`
