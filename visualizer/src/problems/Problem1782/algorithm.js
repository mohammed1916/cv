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
  const frames = [{ phase: 'degree', activeLine: L('count the degree'), query: null, sorted: ordered, total: null, message: `Degrees: ${deg.slice(1).join(', ')}.` }]
  frames.push({ phase: 'sort', activeLine: L('sort the degrees'), query: null, sorted: ordered, total: null, message: `Sorted degrees: ${ordered.join(', ')}.` })
  const answers = []
  for (const q of queries) {
    let total = 0
    let i = 0
    let j = n - 1
    while (i < j) {
      if (ordered[i] + ordered[j] > q) { total += j - i; j-- } else i++
    }
    frames.push({ phase: 'query', activeLine: L('set total to the number of pairs'), query: q, sorted: ordered, total, message: `Query ${q}: ${total} pairs have a degree sum above ${q} before correcting shared edges.` })
    for (const [key, c] of shared) {
      const [a, b] = key.split(',').map(Number)
      const s = deg[a] + deg[b]
      if (s > q && s - c <= q) total--
    }
    frames.push({ phase: 'correct', activeLine: L('decrease total'), query: q, sorted: ordered, total, message: `Shared edges removed from the count: ${total} pairs for query ${q}.` })
    answers.push(total)
  }
  frames.push({ phase: 'done', activeLine: L('return the answers'), query: null, sorted: ordered, total: null, message: `Answers: ${answers.join(', ')}.` })
  return { input, result: answers, frames }
}

export const code = `count pairs of nodes for each query
  count the degree of every node
  sort the degrees
  set answers to an empty list
  for each query q do
    set total to the number of pairs with a degree sum above q, using two pointers
    for each pair of nodes a and b that share c edges do
      if the degree sum is above q but minus c it is at most q then
        decrease total by one
    add total to answers
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_pairs(n, edges, queries):
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
