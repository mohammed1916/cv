export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and edges.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 3 || n > 12) throw new Error('n is an integer from 3 to 12.')
  if (!Array.isArray(edges) || edges.length > 30) throw new Error('edges is a list of at most 30 pairs.')
  const keys = new Set()
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 1 && v <= n)) throw new Error('Each edge is a pair of nodes from 1 to n.')
    const [a, b] = edge
    if (a === b) throw new Error('Edges cannot loop back to the same node.')
    const key = a < b ? `${a},${b}` : `${b},${a}`
    if (keys.has(key)) throw new Error('Each edge appears once.')
    keys.add(key)
  }
  return { n, edges }
}

export function buildTrace({ n, edges }) {
  const frames = []
  const adjacent = Array.from({ length: n + 1 }, () => new Set())
  frames.push({ pythonLine: PY.build, phase: 'start', activeLine: L('build the neighbour sets'), odd: [], pair: null, message: `Read ${edges.length} edges over ${n} nodes.` })
  for (const [a, b] of edges) {
    adjacent[a].add(b)
    adjacent[b].add(a)
  }
  const odd = []
  for (let v = 1; v <= n; v++) if (adjacent[v].size % 2 === 1) odd.push(v)
  frames.push({ pythonLine: PY.odd, phase: 'degree', activeLine: L('collect the odd-degree nodes'), odd: [...odd], pair: null, message: `Odd-degree nodes: ${odd.length ? odd.join(', ') : 'none'}.` })
  const isNew = (a, b) => !adjacent[a].has(b)
  let result = false
  let line = PY.returnFalseOther
  if (odd.length === 0) {
    result = true
    line = PY.returnTrueEven
    frames.push({ pythonLine: line, phase: 'done', activeLine: L('no odd node'), odd, pair: null, message: 'Every degree is already even.' })
  } else if (odd.length === 2) {
    const [a, b] = odd
    if (isNew(a, b)) {
      result = true
      line = PY.returnTrueDirect
      frames.push({ pythonLine: PY.directIf, phase: 'pair', activeLine: L('add one edge between the two'), odd, pair: [a, b], message: `Add ${a}-${b} directly.` })
    } else {
      for (let c = 1; c <= n && !result; c++) {
        if (c === a || c === b) continue
        const ok = isNew(a, c) && isNew(b, c)
        frames.push({ pythonLine: ok ? PY.helperIf : PY.helperLoop, phase: 'detour', activeLine: L('try a helper node'), odd, pair: [a, c, b], message: ok ? `Node ${c} is free from both, so add ${a}-${c} and ${c}-${b}.` : `Node ${c} is already joined to ${a} or ${b}.` })
        if (ok) {
          result = true
          line = PY.returnTrueHelper
        }
      }
      if (!result) line = PY.returnFalseHelper
    }
  } else if (odd.length === 4) {
    const [a, b, c, d] = odd
    for (const [x, y, z, w] of [[a, b, c, d], [a, c, b, d], [a, d, b, c]]) {
      const ok = isNew(x, y) && isNew(z, w)
      frames.push({ pythonLine: PY.pairingIf, phase: 'pairing', activeLine: L('try one pairing'), odd, pair: [x, y, z, w], message: ok ? `Pairing ${x}-${y} and ${z}-${w} adds two new edges.` : `Pairing ${x}-${y} and ${z}-${w} needs an existing edge.` })
      if (ok) {
        result = true
        line = PY.returnTruePairing
        break
      }
    }
    if (!result) line = PY.returnFalsePairing
  } else {
    frames.push({ pythonLine: PY.returnFalseOther, phase: 'done', activeLine: L('more than four odd nodes'), odd, pair: null, message: `${odd.length} odd nodes cannot be fixed with two edges.` })
    return { input: { n, edges }, result, frames }
  }
  frames.push({ pythonLine: line, phase: 'done', activeLine: L(result ? 'return true' : 'return false'), odd, pair: null, message: result ? 'Two new edges can make every degree even.' : 'No choice of two new edges works.' })
  return { input: { n, edges }, result, frames }
}

export const code = `can two new edges make every degree even
  build a neighbour set for every node
  odd = the nodes with an odd number of neighbours
  if odd is empty then return true
  if odd has exactly two nodes a and b
    if a and b are not neighbours then return true
    if some other node c is a neighbour of neither then return true
    return false
  if odd has four nodes
    if one pairing of them gives two non-neighbour pairs then return true
    return false
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_make_even(n, edges):
    adj = [set() for _ in range(n + 1)]
    for a, b in edges:
        adj[a].add(b)
        adj[b].add(a)
    odd = [v for v in range(1, n + 1) if len(adj[v]) % 2 == 1]
    if len(odd) == 0:
        return True
    if len(odd) == 2:
        a, b = odd
        if b not in adj[a]:
            return True
        for c in range(1, n + 1):
            if c != a and c != b and c not in adj[a] and c not in adj[b]:
                return True
        return False
    if len(odd) == 4:
        a, b, c, d = odd
        for x, y, z, w in [(a, b, c, d), (a, c, b, d), (a, d, b, c)]:
            if y not in adj[x] and w not in adj[z]:
                return True
        return False
    return False
`
// 1-based python lines, checked against the export in algorithm.test.mjs
const PY = {
  build: 2, odd: 6, returnTrueEven: 8, directIf: 11, returnTrueDirect: 12,
  helperLoop: 13, helperIf: 14, returnTrueHelper: 15, returnFalseHelper: 16,
  pairingLoop: 19, pairingIf: 20, returnTruePairing: 21, returnFalsePairing: 22, returnFalseOther: 23,
}
