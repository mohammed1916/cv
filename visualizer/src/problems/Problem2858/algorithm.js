export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and edges, such as {"n":3,"edges":[[1,0],[1,2]]}.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('n must be an integer from 2 to 12.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error(`edges must hold exactly ${n - 1} directed pairs.`)
  const owner = Array.from({ length: n }, (_, i) => i)
  const find = x => (owner[x] === x ? x : (owner[x] = find(owner[x])))
  for (const pair of edges) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => Number.isInteger(v) && v >= 0 && v < n) || pair[0] === pair[1]) throw new Error('Each edge is a pair [from, to] of different node numbers from 0 to n-1.')
    const a = find(pair[0]), b = find(pair[1])
    if (a === b) throw new Error('The edges must form a tree, without cycles.')
    owner[a] = b
  }
  return { n, edges }
}

export const code = `minimum edge reversals for every starting node
  build a neighbour list where an edge from u to v is seen from u at cost 0 and from v at cost 1
  walk the tree from node 0 and add the cost of every edge on the way down
  set answer of node 0 to that total
  for each child c of a node p, reached over an edge with cost x
    set answer of c to answer of p plus 1 minus 2 times x
  return the answer list`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, edges }) {
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([from, to]) => {
    adj[from].push({ to, cost: 0 })
    adj[to].push({ to: from, cost: 1 })
  })
  const children = Array.from({ length: n }, () => [])
  const seen = Array(n).fill(false)
  seen[0] = true
  const order = [0]
  const frames = [{ phase: 'build', activeLine: L('build a neighbour list'), current: null, answer: Array(n).fill(null), message: 'Record each edge from both ends. Moving along an edge in its direction costs 0; moving against it costs 1.' }]
  let base = 0
  for (let q = 0; q < order.length; q++) {
    const p = order[q]
    for (const { to, cost } of adj[p]) {
      if (seen[to]) continue
      seen[to] = true
      children[p].push({ to, cost })
      order.push(to)
      base += cost
      frames.push({ phase: 'build', activeLine: L('walk the tree'), current: p, answer: Array(n).fill(null), message: `Walking down from ${p} to ${to} costs ${cost}. Running total: ${base}.` })
    }
  }
  const answer = Array(n).fill(null)
  answer[0] = base
  frames.push({ phase: 'root', activeLine: L('set answer of node 0'), current: 0, answer: [...answer], message: `With node 0 as the start, ${base} edges point toward it and must be reversed.` })
  for (const p of order) {
    for (const { to: c, cost } of children[p]) {
      answer[c] = answer[p] + 1 - 2 * cost
      frames.push({ phase: 'reroot', activeLine: L('set answer of c'), current: c, answer: [...answer], message: `Moving the start from ${p} to ${c} gives ${answer[c]} reversals.` })
    }
  }
  const toTree = id => ({ id, children: children[id].map(child => toTree(child.to)) })
  frames.push({ phase: 'done', activeLine: L('return the answer list'), current: null, answer: [...answer], message: `Answers for nodes 0 to ${n - 1}: ${answer.join(', ')}.` })
  return { input: { n, edges }, tree: toTree(0), result: answer, frames }
}

export const python = `def min_edge_reversals(n, edges):
    adj = [[] for _ in range(n)]
    for start, end in edges:
        adj[start].append((end, 0))
        adj[end].append((start, 1))
    order = [0]
    seen = [False] * n
    seen[0] = True
    children = [[] for _ in range(n)]
    base = 0
    for current in order:
        for other, cost in adj[current]:
            if not seen[other]:
                seen[other] = True
                children[current].append((other, cost))
                base += cost
                order.append(other)
    answer = [0] * n
    answer[0] = base
    for current in order:
        for other, cost in children[current]:
            answer[other] = answer[current] + 1 - 2 * cost
    return answer
`
