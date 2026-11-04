const CODE = [
  'function canMakeEven(n, edges) {',
  '  const adj = Array.from({ length: n + 1 }, () => new Set())',
  '  for (const [a, b] of edges) { adj[a].add(b); adj[b].add(a) }',
  '  const odd = []',
  '  for (let v = 1; v <= n; v++) if (adj[v].size % 2 === 1) odd.push(v)',
  '  if (odd.length === 0) return true',
  '  if (odd.length === 2) {',
  '    const [a, b] = odd',
  '    if (!adj[a].has(b)) return true',
  '    for (let c = 1; c <= n; c++) {',
  '      if (c !== a && c !== b && !adj[a].has(c) && !adj[b].has(c)) return true',
  '    }',
  '    return false // no free helper node joins both odd nodes',
  '  }',
  '  if (odd.length === 4) {',
  '    const [a, b, c, d] = odd',
  '    for (const [x, y, z, w] of [[a, b, c, d], [a, c, b, d], [a, d, b, c]]) {',
  '      if (!adj[x].has(y) && !adj[z].has(w)) return true',
  '    }',
  '    return false // no pairing gives two non-neighbour pairs',
  '  }',
  '  return false // more than four odd nodes cannot be fixed',
  '}',
]

const PY = [
  'def can_make_even(n, edges):',
  '    adj = [set() for _ in range(n + 1)]',
  '    for a, b in edges:',
  '        adj[a].add(b)',
  '        adj[b].add(a)',
  '    odd = [v for v in range(1, n + 1) if len(adj[v]) % 2 == 1]',
  '    if len(odd) == 0:',
  '        return True',
  '    if len(odd) == 2:',
  '        a, b = odd',
  '        if b not in adj[a]:',
  '            return True',
  '        for c in range(1, n + 1):',
  '            if c != a and c != b and c not in adj[a] and c not in adj[b]:',
  '                return True',
  '        return False',
  '    if len(odd) == 4:',
  '        a, b, c, d = odd',
  '        for x, y, z, w in [(a, b, c, d), (a, c, b, d), (a, d, b, c)]:',
  '            if y not in adj[x] and w not in adj[z]:',
  '                return True',
  '        return False',
  '    return False',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Graph', description: 'Read the edges and build neighbour sets.' },
  { id: 'degree', label: 'Odd nodes', description: 'Collect the nodes with an odd degree.' },
  { id: 'pair', label: 'Direct edge', description: 'Two odd nodes that are not neighbours get one edge.' },
  { id: 'detour', label: 'Helper', description: 'Two odd nodes that are neighbours need a helper node.' },
  { id: 'pairing', label: 'Pairing', description: 'Four odd nodes split into two pairs of non-neighbours.' },
  { id: 'done', label: 'Result', description: 'Report whether two new edges are enough.' },
]

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
  frames.push({ pythonLine: at(PY, 'adj = [set() for _ in range(n + 1)]'), activeLine: at(CODE, 'const adj = Array.from({ length: n + 1 }, () => new Set())'), phase: 'start', odd: [], pair: null, message: `Read ${edges.length} edges over ${n} nodes.` })
  for (const [a, b] of edges) {
    adjacent[a].add(b)
    adjacent[b].add(a)
  }
  const odd = []
  for (let v = 1; v <= n; v++) if (adjacent[v].size % 2 === 1) odd.push(v)
  frames.push({ pythonLine: at(PY, 'odd = [v for v in range(1, n + 1) if len(adj[v]) % 2 == 1]'), activeLine: at(CODE, 'for (let v = 1; v <= n; v++) if (adj[v].size % 2 === 1) odd.push(v)'), phase: 'degree', odd: [...odd], pair: null, message: `Odd-degree nodes: ${odd.length ? odd.join(', ') : 'none'}.` })
  const isNew = (a, b) => !adjacent[a].has(b)
  let result = false
  let pyLine = at(PY, 'return False')
  let jsLine = at(CODE, 'return false // more than four odd nodes cannot be fixed')
  if (odd.length === 0) {
    result = true
    pyLine = at(PY, 'return True')
    jsLine = at(CODE, 'if (odd.length === 0) return true')
    frames.push({ pythonLine: pyLine, activeLine: jsLine, phase: 'done', odd, pair: null, message: 'Every degree is already even.' })
  } else if (odd.length === 2) {
    const [a, b] = odd
    if (isNew(a, b)) {
      result = true
      pyLine = at(PY, 'return True')
      jsLine = at(CODE, 'if (!adj[a].has(b)) return true')
      frames.push({ pythonLine: at(PY, 'if b not in adj[a]:'), activeLine: jsLine, phase: 'pair', odd, pair: [a, b], message: `${a} and ${b} are not neighbours, so add ${a}-${b} directly.` })
    } else {
      for (let c = 1; c <= n && !result; c++) {
        if (c === a || c === b) continue
        const ok = isNew(a, c) && isNew(b, c)
        frames.push({ pythonLine: at(PY, ok ? 'return True' : 'if c != a and c != b and c not in adj[a] and c not in adj[b]:'), activeLine: at(CODE, 'if (c !== a && c !== b && !adj[a].has(c) && !adj[b].has(c)) return true'), phase: 'detour', odd, pair: [a, c, b], message: ok ? `Node ${c} is a neighbour of neither, so add ${a}-${c} and ${c}-${b}.` : `Node ${c} is already a neighbour of ${a} or ${b}.` })
        if (ok) {
          result = true
          pyLine = at(PY, 'return True')
          jsLine = at(CODE, 'if (c !== a && c !== b && !adj[a].has(c) && !adj[b].has(c)) return true')
        }
      }
      if (!result) { pyLine = at(PY, 'return False'); jsLine = at(CODE, 'return false // no free helper node joins both odd nodes') }
    }
  } else if (odd.length === 4) {
    const [a, b, c, d] = odd
    for (const [x, y, z, w] of [[a, b, c, d], [a, c, b, d], [a, d, b, c]]) {
      const ok = isNew(x, y) && isNew(z, w)
      frames.push({ pythonLine: at(PY, ok ? 'return True' : 'if y not in adj[x] and w not in adj[z]:'), activeLine: at(CODE, 'if (!adj[x].has(y) && !adj[z].has(w)) return true'), phase: 'pairing', odd, pair: [x, y, z, w], message: ok ? `Pairing ${x}-${y} and ${z}-${w} adds two new edges.` : `Pairing ${x}-${y} and ${z}-${w} repeats an existing edge.` })
      if (ok) {
        result = true
        pyLine = at(PY, 'return True')
        jsLine = at(CODE, 'if (!adj[x].has(y) && !adj[z].has(w)) return true')
        break
      }
    }
    if (!result) { pyLine = at(PY, 'return False'); jsLine = at(CODE, 'return false // no pairing gives two non-neighbour pairs') }
  } else {
    frames.push({ pythonLine: pyLine, activeLine: jsLine, phase: 'done', odd, pair: null, message: `${odd.length} odd nodes cannot be fixed with two edges.` })
    return { input: { n, edges }, result, frames }
  }
  frames.push({ pythonLine: pyLine, activeLine: jsLine, phase: 'done', odd, pair: null, message: result ? 'Two new edges can make every degree even.' : 'No choice of two new edges works.' })
  return { input: { n, edges }, result, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
