export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.n) || !Number.isInteger(data.k) || !Array.isArray(data.stay_score) || !Array.isArray(data.travel_score)) throw new Error('Use an object with integers n and k and arrays stay_score and travel_score.')
  if (data.n < 1 || data.n > 6 || data.k < 1 || data.k > 6) throw new Error('n and k must be 1 to 6.')
  const ok = v => Number.isInteger(v) && v >= 0 && v <= 100
  if (data.stay_score.length !== data.k || data.stay_score.some(row => !Array.isArray(row) || row.length !== data.n || !row.every(ok))) throw new Error('stay_score must be k rows of n scores from 0 to 100.')
  if (data.travel_score.length !== data.n || data.travel_score.some((row, i) => !Array.isArray(row) || row.length !== data.n || !row.every(ok) || row[i] !== 0)) throw new Error('travel_score must be n by n scores from 0 to 100 with zeros on the diagonal.')
  return { n: data.n, k: data.k, stay_score: data.stay_score, travel_score: data.travel_score }
}

export function buildTrace(input) {
  const { n, k, stay_score, travel_score } = input
  let best = Array.from({ length: n }, () => 0)
  const frames = [{ phase: 'start', activeLine: L('set best to 0'), day: -1, best: best.slice(), result: null, message: `Before day 0 the tourist can be in any of the ${n} cities with 0 points.` }]
  for (let d = 0; d < k; d++) {
    const next = Array.from({ length: n }, () => 0)
    for (let c = 0; c < n; c++) {
      const options = [best[c] + stay_score[d][c]]
      for (let p = 0; p < n; p++) if (p !== c) options.push(best[p] + travel_score[p][c])
      next[c] = Math.max(...options)
    }
    best = next
    frames.push({ phase: 'day', activeLine: L('set next[c]'), day: d, best: best.slice(), result: null, message: `After day ${d}, the best total for each city is ${best.join(', ')}.` })
  }
  const result = Math.max(...best)
  frames.push({ phase: 'done', activeLine: L('return the largest'), day: k, best: best.slice(), result, message: `The most points the tourist can earn is ${result}.` })
  return { input, result, frames }
}

export const code = `maximum points the tourist can earn (n, k, stay_score, travel_score)
  set best to 0 for every city
  for each day d from 0 to k minus 1
    set next to zeros for every city
    for each city c
      set next[c] to the largest of: best[c] plus stay_score[d][c], and best[p] plus travel_score[p][c] for each other city p
    set best to next
  return the largest value in best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_points(n, k, stay_score, travel_score):
    best = [0] * n
    for d in range(k):
        nxt = [0] * n
        for c in range(n):
            options = [best[c] + stay_score[d][c]]
            options += [best[p] + travel_score[p][c] for p in range(n) if p != c]
            nxt[c] = max(options)
        best = nxt
    return max(best)
`
