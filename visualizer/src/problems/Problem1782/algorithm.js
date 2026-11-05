export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.edges) || !Array.isArray(obj.queries)) throw new Error('Use an object with n, edges and queries.')
  const { n, edges, queries } = obj
  if (!Number.isInteger(n) || n < 2 || n > 8) throw new Error('n is an integer from 2 to 8 in this visualization.')
  if (edges.length < 1 || edges.length > 12) throw new Error('edges needs 1 to 12 pairs.')
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(v => Number.isInteger(v) && v >= 1 && v <= n) || e[0] === e[1]) throw new Error('Each edge is two different nodes from 1 to n.')
  }
  if (queries.length < 1 || queries.length > 6 || queries.some(q => !Number.isInteger(q) || q < 0 || q > 20)) throw new Error('queries has 1 to 6 integers from 0 to 20.')
  return { n, edges, queries }
}

export function buildTrace(input) {
  const { n, edges, queries } = input
  const deg = new Array(n + 1).fill(0)
  const shared = new Map()
  for (const [u, v] of edges) {
    deg[u]++
    deg[v]++
    const key = `${Math.min(u, v)},${Math.max(u, v)}`
    shared.set(key, (shared.get(key) || 0) + 1)
  }
  const ordered = deg.slice(1).sort((a, b) => a - b)
  const frames = [{ phase: 'degree', pythonLine: 8, activeLine: L('const deg = new Array'), query: null, sorted: ordered, total: null, message: `Degrees: ${deg.slice(1).join(', ')}.` }]
  frames.push({ phase: 'sort', pythonLine: 9, activeLine: L('const ordered = deg'), query: null, sorted: ordered, total: null, message: `Sorted degrees: ${ordered.join(', ')}.` })
  const answers = []
  for (const q of queries) {
    let total = 0
    let i = 0
    let j = n - 1
    while (i < j) {
      const sum = ordered[i] + ordered[j]
      frames.push({ phase: 'scan', pythonLine: 16, activeLine: L('while (i < j)'), query: q, sorted: ordered, total, i, j, message: `Pointers at ${i} and ${j}: degree sum ${sum} ${sum > q ? `is above ${q}, so all ${j - i} pairs ending at ${j} count` : `is at most ${q}, so move i up`}.` })
      if (sum > q) { total += j - i; j-- } else i++
    }
    frames.push({ phase: 'query', pythonLine: 15, activeLine: L('while (i < j)'), query: q, sorted: ordered, total, message: `Query ${q}: ${total} pairs have a degree sum above ${q} before correcting shared edges.` })
    for (const [key, c] of shared) {
      const [a, b] = key.split(',').map(Number)
      const s = deg[a] + deg[b]
      if (s > q && s - c <= q) total--
    }
    frames.push({ phase: 'correct', pythonLine: 24, activeLine: L('total--'), query: q, sorted: ordered, total, message: `Shared edges removed from the count: ${total} pairs for query ${q}.` })
    answers.push(total)
  }
  frames.push({ phase: 'done', pythonLine: 26, activeLine: L('return answers'), query: null, sorted: ordered, total: null, message: `Answers: ${answers.join(', ')}.` })
  return { input, result: answers, frames }
}

export const code = `function countPairsOfNodes(n, edges, queries) {
  const deg = new Array(n + 1).fill(0)
  const shared = new Map()
  for (const [u, v] of edges) {
    deg[u]++
    deg[v]++
    const key = Math.min(u, v) + ',' + Math.max(u, v)
    shared.set(key, (shared.get(key) || 0) + 1)
  }
  const ordered = deg.slice(1).sort((a, b) => a - b)
  const answers = []
  for (const q of queries) {
    let total = 0
    let i = 0
    let j = n - 1
    while (i < j) {
      if (ordered[i] + ordered[j] > q) { total += j - i; j-- } else i++
    }
    for (const [key, c] of shared) {
      const [a, b] = key.split(',').map(Number)
      const s = deg[a] + deg[b]
      if (s > q && s - c <= q) total--
    }
    answers.push(total)
  }
  return answers
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_pairs_of_nodes(n, edges, queries):
    deg = [0] * (n + 1)
    shared = {}
    for u, v in edges:
        deg[u] += 1
        deg[v] += 1
        key = (min(u, v), max(u, v))
        shared[key] = shared.get(key, 0) + 1
    ordered = sorted(deg[1:])
    answers = []
    for q in queries:
        total = 0
        i = 0
        j = n - 1
        while i < j:
            if ordered[i] + ordered[j] > q:
                total += j - i
                j -= 1
            else:
                i += 1
        for (a, b), c in shared.items():
            s = deg[a] + deg[b]
            if s > q and s - c <= q:
                total -= 1
        answers.append(total)
    return answers
`
