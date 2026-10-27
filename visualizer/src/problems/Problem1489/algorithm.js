export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and edges.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 2 || n > 6) throw new Error('n is an integer from 2 to 6.')
  if (!Array.isArray(edges) || edges.length < 1 || edges.length > 8) throw new Error('Use 1 to 8 edges.')
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3) throw new Error('Each edge is [a, b, weight].')
    const [a, b, w] = e
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= n || b >= n || a === b) throw new Error('Edge endpoints are different vertices from 0 to n - 1.')
    if (!Number.isInteger(w) || w < 1 || w > 6) throw new Error('Edge weights are integers from 1 to 6.')
  }
  // The graph must be connected so that a spanning tree exists.
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const [a, b] of edges) parent[find(a)] = find(b)
  if (new Set(parent.map((_, i) => find(i))).size !== 1) throw new Error('The graph must be connected.')
  return { n, edges }
}

export function buildTrace({ n, edges }) {
  const order = edges.map((_, i) => i).sort((x, y) => edges[x][2] - edges[y][2] || x - y)
  // Kruskal's weight with an optional forced edge, or with one edge skipped. Infinity if no spanning tree.
  const mst = (forced, skip) => {
    const parent = Array.from({ length: n }, (_, i) => i)
    const find = x => {
      while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] }
      return x
    }
    let total = 0
    let used = 0
    if (forced !== null) {
      const [a, b, w] = edges[forced]
      parent[find(a)] = find(b)
      total += w
      used++
    }
    for (const i of order) {
      if (i === skip || i === forced) continue
      const [a, b, w] = edges[i]
      const ra = find(a)
      const rb = find(b)
      if (ra !== rb) { parent[ra] = rb; total += w; used++ }
    }
    return used === n - 1 ? total : Infinity
  }
  const base = mst(null, null)
  const status = edges.map(() => '')
  const frames = [{ phase: 'start', activeLine: L('build the minimum'), index: -1, status: [...status], base, message: `The minimum spanning tree weighs ${base}.` }]
  edges.forEach((_, i) => {
    let activeLine
    if (mst(null, i) > base) {
      status[i] = 'critical'
      activeLine = L('remove edge i')
    } else {
      activeLine = L('otherwise force')
      if (mst(i, null) === base) status[i] = 'pseudo'
    }
    frames.push({ phase: 'test', activeLine, index: i, status: [...status], base, message: status[i] === 'critical' ? `Edge ${i} is critical: without it the weight rises.` : status[i] === 'pseudo' ? `Edge ${i} is pseudo-critical: it can always be in a minimum tree.` : `Edge ${i} is in no minimum tree.` })
  })
  const critical = edges.map((_, i) => i).filter(i => status[i] === 'critical')
  const pseudo = edges.map((_, i) => i).filter(i => status[i] === 'pseudo')
  frames.push({ phase: 'done', activeLine: L('return the critical'), index: edges.length, status: [...status], base, message: `Critical: [${critical.join(', ')}]. Pseudo-critical: [${pseudo.join(', ')}].` })
  return { input: { n, edges }, result: [critical, pseudo], frames }
}

export const code = `find the edges every minimum spanning tree needs, and the edges that some but not all need
build the minimum spanning tree weight base with Kruskal over the edges sorted by weight
for each edge i do
  remove edge i and rebuild: if the weight rises above base, edge i is critical
  otherwise force edge i into the tree first: if the weight is still base, edge i is pseudo-critical
return the critical and pseudo-critical edge indices`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_critical_and_pseudo(n, edges):
    order = sorted(range(len(edges)), key=lambda i: edges[i][2])

    def mst(forced=None, skip=None):
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        total = 0
        used = 0
        if forced is not None:
            a, b, w = edges[forced]
            parent[find(a)] = find(b)
            total += w
            used += 1
        for i in order:
            if i == skip or i == forced:
                continue
            a, b, w = edges[i]
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
                total += w
                used += 1
        return total if used == n - 1 else float('inf')

    base = mst()
    critical, pseudo = [], []
    for i in range(len(edges)):
        if mst(skip=i) > base:
            critical.append(i)
        elif mst(forced=i) == base:
            pseudo.append(i)
    return [critical, pseudo]
`
