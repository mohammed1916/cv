const CODE = [
  'function maxXorDisjoint(values, edges) {',
  '  const n = values.length',
  '  const adj = Array.from({ length: n }, () => [])',
  '  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }',
  '  const parent = Array(n).fill(-1)',
  '  const order = [0]',
  '  for (let i = 0; i < order.length; i++) {',
  '    const v = order[i]',
  '    for (const w of adj[v]) if (w !== parent[v]) { parent[w] = v; order.push(w) }',
  '  }',
  '  const sums = [...values]',
  '  for (const v of order.slice(1).reverse()) sums[parent[v]] += sums[v]',
  '  const isAncestor = (a, b) => { for (let x = b; x !== -1; x = parent[x]) if (x === a) return true; return false }',
  '  let best = 0',
  '  for (let u = 0; u < n; u++) {',
  '    for (let v = u + 1; v < n; v++) {',
  '      if (!isAncestor(u, v) && !isAncestor(v, u)) best = Math.max(best, sums[u] ^ sums[v])',
  '    }',
  '  }',
  '  return best',
  '}',
]

const PY = [
  'def max_xor_disjoint(values, edges):',
  '    n = len(values)',
  '    adj = [[] for _ in range(n)]',
  '    for a, b in edges:',
  '        adj[a].append(b)',
  '        adj[b].append(a)',
  '    parent = [-1] * n',
  '    order = [0]',
  '    for v in order:',
  '        for w in adj[v]:',
  '            if w != parent[v]:',
  '                parent[w] = v',
  '                order.append(w)',
  '    sums = list(values)',
  '    for v in reversed(order[1:]):',
  '        sums[parent[v]] += sums[v]',
  '    def is_ancestor(a, b):',
  '        while b != -1:',
  '            if b == a:',
  '                return True',
  '            b = parent[b]',
  '        return False',
  '    best = 0',
  '    for u in range(n):',
  '        for v in range(u + 1, n):',
  '            if not is_ancestor(u, v) and not is_ancestor(v, u):',
  '                best = max(best, sums[u] ^ sums[v])',
  '    return best',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text.trim()))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Root', description: 'Root the tree at node 0.' },
  { id: 'sums', label: 'Sums', description: 'Each subtree sum is its node value plus its children sums.' },
  { id: 'pair', label: 'Pair', description: 'Test a pair of nodes that are not in an ancestor relation.' },
  { id: 'done', label: 'Result', description: 'The best pair XOR is the answer.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with values and edges.')
  const { values, edges } = input
  if (!Array.isArray(values) || values.length < 1 || values.length > 10) throw new Error('values has 1 to 10 nodes in this visualization.')
  const n = values.length
  if (!values.every(v => Number.isInteger(v) && v >= 1 && v <= 50)) throw new Error('Node values are integers from 1 to 50 in this visualization.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('A tree on n nodes has n minus 1 edges.')
  const adj = Array.from({ length: n }, () => [])
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(x => Number.isInteger(x) && x >= 0 && x < n) || e[0] === e[1]) throw new Error('Each edge joins two different nodes from 0 to n-1.')
    adj[e[0]].push(e[1])
    adj[e[1]].push(e[0])
  }
  const seen = new Set([0])
  for (const v of seen) for (const w of adj[v]) seen.add(w)
  if (seen.size !== n) throw new Error('The edges must connect every node.')
  return { values, edges }
}

export function buildTrace({ values, edges }) {
  const n = values.length
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) {
    adj[a].push(b)
    adj[b].push(a)
  }
  const parent = Array(n).fill(-1)
  const order = [0]
  for (let i = 0; i < order.length; i++) {
    const v = order[i]
    for (const w of adj[v]) if (w !== parent[v]) { parent[w] = v; order.push(w) }
  }
  const sums = [...values]
  const frames = []
  const isAnc = (a, b) => { for (let x = b; x !== -1; x = parent[x]) if (x === a) return true; return false }
  frames.push({ pythonLine: pyLine('order = [0]'), phase: 'start', activeLine: codeLine('const order = [0]'), node: null, pair: null, sums: null, candidates: [], best: 0, message: `Root the tree at 0. Parents: ${parent.map((p, v) => (v === 0 ? '-' : `${v}<-${p}`)).slice(1).join(', ') || 'none'}.` })
  for (const v of [...order].reverse().slice(0, n - 1)) {
    sums[parent[v]] += sums[v]
  }
  // Show each node's subtree sum as its own frame, in leaves-first order.
  const built = Array(n).fill(null)
  for (const v of [...order].reverse()) {
    built[v] = values[v]
    for (const w of adj[v]) if (w !== parent[v]) built[v] += built[w]
    frames.push({ pythonLine: pyLine('sums[parent[v]] += sums[v]'), phase: 'sums', activeLine: codeLine('for (const v of order.slice(1).reverse())'), node: v, pair: null, sums: built.map(x => x), candidates: [], best: 0, message: `Subtree of ${v} sums to ${built[v]}.` })
  }
  let best = 0
  const candidates = []
  for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) {
    const related = isAnc(u, v) || isAnc(v, u)
    const x = sums[u] ^ sums[v]
    if (!related) {
      best = Math.max(best, x)
      candidates.push({ u, v, xor: x, related: false })
    } else {
      candidates.push({ u, v, xor: null, related: true })
    }
    frames.push({ pythonLine: pyLine('best = max(best, sums[u] ^ sums[v])'), phase: 'pair', activeLine: codeLine(related ? 'if (!isAncestor(u, v) && !isAncestor(v, u))' : 'best = Math.max(best, sums[u] ^ sums[v])'), node: null, pair: [u, v], sums: [...sums], candidates: candidates.map(c => ({ ...c })), best, message: related ? `Nodes ${u} and ${v} are in an ancestor relation, so they cannot both be chosen.` : `Nodes ${u} and ${v} are disjoint: ${sums[u]} XOR ${sums[v]} = ${x}. Best so far ${best}.` })
  }
  frames.push({ pythonLine: pyLine('return best'), phase: 'done', activeLine: codeLine('return best'), node: null, pair: null, sums: [...sums], candidates: candidates.map(c => ({ ...c })), best, message: `The best XOR of two disjoint subtree sums is ${best}.` })
  return { input: { values, edges }, result: best, sums: [...sums], frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
