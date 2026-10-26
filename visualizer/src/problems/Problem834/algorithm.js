export function parseInput(text) {
  const d = JSON.parse(text)
  if (!d || !Number.isInteger(d.n) || !Array.isArray(d.edges)) throw new Error('Enter JSON like {"n": 3, "edges": [[0,1],[1,2]]}.')
  if (d.n < 1 || d.n > 12) throw new Error('n must be between 1 and 12 (visualization cap).')
  if (d.edges.length !== d.n - 1 || d.edges.some(e => !Array.isArray(e) || e.length !== 2 || e.some(v => !Number.isInteger(v) || v < 0 || v >= d.n) || e[0] === e[1])) throw new Error('Provide exactly n-1 edges [a, b] with distinct endpoints in 0..n-1.')
  const g = Array.from({ length: d.n }, () => [])
  d.edges.forEach(([a, b]) => { g[a].push(b); g[b].push(a) })
  const seen = new Set([0]); const q = [0]
  while (q.length) for (const v of g[q.pop()]) if (!seen.has(v)) { seen.add(v); q.push(v) }
  if (seen.size !== d.n) throw new Error('The edges must connect all nodes into a single tree.')
  return { n: d.n, edges: d.edges.map(e => [...e]) }
}
export function buildTrace({ n, edges }) {
  const g = Array.from({ length: n }, () => [])
  edges.forEach(([a, b]) => { g[a].push(b); g[b].push(a) })
  const count = new Array(n).fill(1)
  const res = new Array(n).fill(0)
  const build = (u, p) => ({ id: u, children: g[u].filter(v => v !== p).map(v => build(v, u)) })
  const root = build(0, -1)
  const snap = (extra) => ({ count: [...count], res: [...res], ...extra })
  const frames = [snap({ phase: 'start', u: 0, v: -1, stage: 'up', activeLine: 6, message: 'Root the tree at 0. count[u] is the subtree size; res[u] will first be the sum of distances to nodes inside u\'s subtree.' })]
  const post = (u, p) => {
    for (const v of g[u]) {
      if (v === p) continue
      post(v, u)
      count[u] += count[v]
      res[u] += res[v] + count[v]
      frames.push(snap({ phase: 'up', u, v, stage: 'up', activeLine: 13, message: `Merge child ${v} into ${u}: its ${count[v]} node(s) are each one edge farther, so res[${u}] += res[${v}] + count[${v}]. Now count[${u}] = ${count[u]}, res[${u}] = ${res[u]}.` }))
    }
  }
  post(0, -1)
  frames.push(snap({ phase: 'root', u: 0, v: -1, stage: 'down', activeLine: 20, message: `The root sees every node inside its subtree, so res[0] = ${res[0]} is already final.` }))
  const pre = (u, p) => {
    for (const v of g[u]) {
      if (v === p) continue
      res[v] = res[u] - count[v] + n - count[v]
      frames.push(snap({ phase: 'down', u, v, stage: 'down', activeLine: 17, message: `Move the root from ${u} to ${v}: the ${count[v]} node(s) under ${v} get 1 closer, the other ${n - count[v]} get 1 farther. res[${v}] = res[${u}] - ${count[v]} + ${n - count[v]} = ${res[v]}.` }))
      pre(v, u)
    }
  }
  pre(0, -1)
  frames.push(snap({ phase: 'done', u: -1, v: -1, stage: 'down', activeLine: 21, message: `Answer: [${res.join(', ')}].` }))
  return { input: { n, edges }, root, result: [...res], frames }
}
export const code = `def sumOfDistancesInTree(n, edges):
    g = [[] for _ in range(n)]
    for a, b in edges:
        g[a].append(b)
        g[b].append(a)
    count = [1] * n
    res = [0] * n
    def post(u, p):
        for v in g[u]:
            if v != p:
                post(v, u)
                count[u] += count[v]
                res[u] += res[v] + count[v]
    def pre(u, p):
        for v in g[u]:
            if v != p:
                res[v] = res[u] - count[v] + n - count[v]
                pre(v, u)
    post(0, -1)
    pre(0, -1)
    return res`.split('\n').map((text, index) => ({ line: index + 1, text }))
