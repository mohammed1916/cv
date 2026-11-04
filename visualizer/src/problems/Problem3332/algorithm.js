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
  const history = [best.slice()]
  const frames = [{ pythonLine: PY('best = [0] * n'), phase: 'start', activeLine: L('let best = Array'), day: -1, best: best.slice(), result: null, message: `Before day 0 the tourist can be in any of the ${n} cities with 0 points.` }]
  for (let d = 0; d < k; d++) {
    const next = Array.from({ length: n }, () => 0)
    for (let c = 0; c < n; c++) {
      const options = [best[c] + stay_score[d][c]]
      for (let p = 0; p < n; p++) if (p !== c) options.push(best[p] + travel_score[p][c])
      next[c] = Math.max(...options)
    }
    best = next
    history.push(best.slice())
    frames.push({ pythonLine: PY('nxt[c] = max(options)'), phase: 'day', activeLine: L('next[c] = Math.max'), day: d, best: best.slice(), history: history.map(r => r.slice()), result: null, message: `After day ${d}, the best total for each city is ${best.join(', ')}.` })
  }
  const result = Math.max(...best)
  frames.push({ pythonLine: PY('return max(best)'), phase: 'done', activeLine: L('return Math.max'), day: k, best: best.slice(), history: history.map(r => r.slice()), result, message: `The most points the tourist can earn is ${result}.` })
  return { input, result, frames }
}

// Code panel: real JavaScript. Python below mirrors it line for line.
export const code = [
  "function maxPoints(n, k, stayScore, travelScore) {",
  "  let best = Array(n).fill(0);",
  "  for (let d = 0; d < k; d++) {",
  "    const next = Array(n).fill(0);",
  "    for (let c = 0; c < n; c++) {",
  "      const options = [best[c] + stayScore[d][c]];",
  "      for (let p = 0; p < n; p++) if (p !== c) options.push(best[p] + travelScore[p][c]);",
  "      next[c] = Math.max(...options);",
  "    }",
  "    best = next;",
  "  }",
  "  return Math.max(...best);",
  "}",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

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
