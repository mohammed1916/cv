export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n)) throw new Error('Use a JSON object with an integer n, edges and good.')
  const { n, edges, good } = input
  if (n < 2 || n > 12) throw new Error('n must be an integer from 2 to 12 (visualization cap).')
  if (!Array.isArray(edges) || edges.length !== n - 1 || !Array.isArray(good) || good.length !== n) throw new Error('edges needs n - 1 pairs and good needs n values.')
  if (edges.some(e => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || !Number.isInteger(e[1]) || e[0] < 0 || e[1] < 0 || e[0] >= n || e[1] >= n || e[0] === e[1])) throw new Error('Each edge joins two different nodes from 0 to n - 1.')
  if (good.some(v => v !== 0 && v !== 1)) throw new Error('good values are 0 or 1.')
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const seen = new Set([0])
  const queue = [0]
  for (let h = 0; h < queue.length; h++) for (const y of adj[queue[h]]) if (!seen.has(y)) { seen.add(y); queue.push(y) }
  if (seen.size !== n) throw new Error('edges must form a tree.')
  return input
}

export function buildTrace(input) {
  const { n, edges, good } = input
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const weight = v => (good[v] ? 1 : -1)
  const best = (v, parent) => {
    let total = weight(v)
    for (const c of adj[v]) if (c !== parent) total += Math.max(0, best(c, v))
    return total
  }
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('answers is empty'), root: -1, answers: [], message: 'Each node becomes the root in turn, and the best subgraph containing it is grown from there.' }]
  for (let r = 0; r < n; r++) {
    answers.push(best(r, -1))
    frames.push({ phase: 'root', activeLine: L('call best on r'), root: r, answers: [...answers], message: `The best connected subgraph containing node ${r} scores ${answers[r]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answers'), root: -1, answers: [...answers], message: `Answers: ${answers.join(', ')}.` })
  return { input, result: answers, frames }
}

export const code = `maximum subgraph score (n, edges, good):
  build adjacency lists from edges
  answers is empty
  for each node r from 0 to n - 1
    call best on r with no parent
    append that value to answers
  return answers
best(v, parent):
  total = +1 if v is good, otherwise -1
  for each neighbour c of v other than parent
    add the larger of 0 and best(c, v) to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_subgraph_score(n, edges, good):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)

    def best(v, parent):
        total = 1 if good[v] else -1
        for c in adj[v]:
            if c != parent:
                total += max(0, best(c, v))
        return total

    return [best(r, -1) for r in range(n)]
`
