export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n and edges.')
  const { n, edges } = data
  if (!Number.isInteger(n) || n < 1 || n > 20) throw new Error('n must be an integer from 1 to 20.')
  if (!Array.isArray(edges) || edges.length > 30) throw new Error('edges must be an array of at most 30 pairs.')
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 0 && v < n)) throw new Error('Each edge is a pair of nodes from 0 to n-1.')
    if (edge[0] === edge[1]) throw new Error('An edge cannot join a node to itself.')
  }
  return { n, edges }
}

export function buildTrace({ n, edges }) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const size = Array(n).fill(1)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  const frames = []
  const frame = (phase, line, node, message) => frames.push({ phase, activeLine: line, node, parent: [...parent], size: [...size], message })
  frame('start', L('give each node its own root'), null, `Start with ${n} separate nodes.`)
  for (const [a, b] of edges) {
    let ra = find(a)
    let rb = find(b)
    if (ra !== rb) {
      if (size[ra] < size[rb]) [ra, rb] = [rb, ra]
      parent[rb] = ra
      size[ra] += size[rb]
      frame('union', L('merge the smaller root'), a, `Edge ${a}-${b} joins two components; root ${rb} now points to ${ra}.`)
    } else {
      frame('same', L('if the roots differ'), a, `Edge ${a}-${b} stays inside one component.`)
    }
  }
  let remaining = n
  let answer = 0
  for (let r = 0; r < n; r++) {
    if (find(r) !== r) continue
    remaining -= size[r]
    answer += size[r] * remaining
    frame('count', L('add size of r'), r, `Component rooted at ${r} has ${size[r]} nodes and adds ${size[r] * remaining} pairs.`)
  }
  frame('done', L('return answer'), null, `Unreachable pairs: ${answer}.`)
  return { input: { n, edges }, result: answer, frames }
}

export const code = `count pairs of nodes with no path between them
  give each node its own root, with size 1
  for each edge [a, b] do
    find the root of a and the root of b
    if the roots differ then
      merge the smaller root into the larger one
  set remaining to n and answer to 0
  for each root r do
    set remaining to remaining minus the size of r
    add size of r times remaining to answer
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def count_unreachable_pairs(n, edges):
    parent = list(range(n))
    size = [1] * n

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    for a, b in edges:
        ra = find(a)
        rb = find(b)
        if ra != rb:
            if size[ra] < size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[ra] += size[rb]
    remaining = n
    answer = 0
    for r in range(n):
        if find(r) == r:
            remaining -= size[r]
            answer += size[r] * remaining
    return answer
`
