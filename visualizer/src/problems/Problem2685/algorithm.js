export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input?.n) || input.n < 1 || input.n > 8) throw new Error('n is an integer from 1 to 8.')
  if (!Array.isArray(input.edges) || input.edges.length > 20) throw new Error('edges has at most 20 pairs.')
  const seen = new Set()
  input.edges.forEach(e => {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(v => Number.isInteger(v) && v >= 0 && v < input.n) || e[0] === e[1]) throw new Error('Each edge is [a, b] with two different vertices from 0 to n-1.')
    const key = e[0] < e[1] ? `${e[0]}-${e[1]}` : `${e[1]}-${e[0]}`
    if (seen.has(key)) throw new Error('Each pair of vertices appears at most once.')
    seen.add(key)
  })
  return { n: input.n, edges: input.edges }
}

export const code = `function countCompleteComponents(n, edges)
  parent[v] <- v, size[v] <- 1, edgeCount[v] <- 0 for every vertex v
  for each edge [a, b]
    ra <- root of a, rb <- root of b
    if ra equals rb
      edgeCount[ra] <- edgeCount[ra] + 1
    else
      merge the smaller tree into the larger one
      edgeCount[new root] <- edgeCount[ra] + edgeCount[rb] + 1
  count <- 0
  for each root r
    if edgeCount[r] equals size[r] times (size[r] minus 1) divided by 2
      count <- count + 1
  RETURN count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def count_complete_components(n, edges):
    parent = list(range(n))
    size = [1] * n
    edge_count = [0] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            edge_count[ra] += 1
        else:
            if size[ra] < size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[ra] += size[rb]
            edge_count[ra] += edge_count[rb] + 1
    count = 0
    for v in range(n):
        if find(v) == v and edge_count[v] == size[v] * (size[v] - 1) // 2:
            count += 1
    return count
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export function buildTrace({ n, edges }) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const size = Array(n).fill(1)
  const edgeCount = Array(n).fill(0)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  const label = () => parent.map((_, v) => `c${find(v)}`)
  const frames = []
  const snap = fields => frames.push({ n, edges, tags: Object.fromEntries(label().map((t, v) => [v, t])), current: null, neighbour: null, edgeIndex: -1, result: null, ...fields })
  snap({ phase: 'setup', activeLine: CL('parent[v] <- v'), pythonLine: PL('parent = list(range(n))'), message: `${n} vertices, each alone in its own component.` })
  edges.forEach(([a, b], index) => {
    let ra = find(a), rb = find(b)
    if (ra === rb) {
      edgeCount[ra] += 1
      snap({ phase: 'same', activeLine: CL('edgeCount[ra] <- edgeCount[ra] + 1'), pythonLine: PL('edge_count[ra] += 1'), current: a, neighbour: b, edgeIndex: index, message: `Edge ${a}-${b} joins two vertices already in one component; that component gains an edge.` })
    } else {
      if (size[ra] < size[rb]) [ra, rb] = [rb, ra]
      parent[rb] = ra
      size[ra] += size[rb]
      edgeCount[ra] += edgeCount[rb] + 1
      snap({ phase: 'merge', activeLine: CL('edgeCount[new root]'), pythonLine: PL('edge_count[ra] += edge_count[rb] + 1'), current: a, neighbour: b, edgeIndex: index, message: `Edge ${a}-${b} merges two components into one of ${size[ra]} vertices with ${edgeCount[ra]} edges.` })
    }
  })
  let count = 0
  for (let v = 0; v < n; v++) {
    if (find(v) !== v) continue
    const complete = edgeCount[v] === size[v] * (size[v] - 1) / 2
    if (complete) count += 1
    snap({ phase: 'check', activeLine: CL('edgeCount[r] equals'), pythonLine: PL('edge_count[v] == size[v]'), current: v, neighbour: null, edgeIndex: -1, message: `Component of ${v} has ${size[v]} vertices and ${edgeCount[v]} edges: ${complete ? 'complete' : 'not complete'}.` })
  }
  snap({ phase: 'done', activeLine: CL('RETURN count'), pythonLine: PL('return count'), current: null, neighbour: null, edgeIndex: -1, message: `${count} complete component${count === 1 ? '' : 's'}.`, result: count })
  return { input: { n, edges }, result: count, frames }
}
