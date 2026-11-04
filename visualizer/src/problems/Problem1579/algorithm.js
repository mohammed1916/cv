export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, edges } = data ?? {}
  if (!Number.isInteger(n) || n < 2 || n > 6) throw new Error('"n" is an integer from 2 to 6 in this visualization.')
  if (!Array.isArray(edges) || edges.length < 1 || edges.length > 10) throw new Error('Use "edges" as 1 to 10 [type, u, v] triples.')
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3 || ![1, 2, 3].includes(e[0])) throw new Error('Each edge is [type, u, v] with type 1, 2, or 3.')
    const [, u, v] = e
    if (!Number.isInteger(u) || !Number.isInteger(v) || u < 1 || v < 1 || u > n || v > n || u === v) throw new Error('Edge endpoints are different nodes from 1 to n.')
  }
  return { n, edges }
}

export function buildTrace({ n, edges }) {
  const pa = Array.from({ length: n + 1 }, (_, i) => i)
  const pb = Array.from({ length: n + 1 }, (_, i) => i)
  const find = (p, x) => { while (p[x] !== x) x = p[x]; return x }
  const unite = (p, u, v) => {
    const ru = find(p, u)
    const rv = find(p, v)
    if (ru === rv) return false
    p[ru] = rv
    return true
  }
  const groups = [n, n]
  const decisions = Array(edges.length).fill('pending')
  let kept = 0
  const order = edges.map((_, i) => i).sort((a, b) => edges[b][0] - edges[a][0] || a - b)
  const frames = [{ phase: 'start', pythonLine: 17, activeLine: L('const pa = Array'), edge: -1, decisions: [...decisions], groups: [...groups], kept, message: `Alice and Bob each start with ${n} separate nodes.` }]
  for (const idx of order) {
    const [t, u, v] = edges[idx]
    let line
    if (t === 3) {
      line = 'const a = unite'
      const a = unite(pa, u, v)
      const b = unite(pb, u, v)
      if (a) groups[0]--
      if (b) groups[1]--
      if (a || b) { kept++; decisions[idx] = 'kept' } else decisions[idx] = 'removed'
    } else if (t === 1) {
      line = 'if (unite(pa'
      if (unite(pa, u, v)) { groups[0]--; kept++; decisions[idx] = 'kept' } else decisions[idx] = 'removed'
    } else {
      line = 'if (unite(pb'
      if (unite(pb, u, v)) { groups[1]--; kept++; decisions[idx] = 'kept' } else decisions[idx] = 'removed'
    }
    frames.push({ phase: 'edge', pythonLine: t === 3 ? (decisions[idx] === 'kept' ? 28 : 27) : t === 1 ? (decisions[idx] === 'kept' ? 32 : 30) : (decisions[idx] === 'kept' ? 36 : 34), activeLine: L(line), edge: idx, decisions: [...decisions], groups: [...groups], kept, message: `Edge ${idx} (type ${t}, ${u}-${v}) is ${decisions[idx]}.` })
  }
  const ok = groups[0] === 1 && groups[1] === 1
  const result = ok ? edges.length - kept : -1
  frames.push({ phase: 'done', pythonLine: ok ? 38 : 39, activeLine: L('return edges.length - kept'), edge: -1, decisions: [...decisions], groups: [...groups], kept, message: ok ? `Both can reach every node; remove ${result} edges.` : 'Alice or Bob cannot reach every node, so the answer is -1.' })
  return { input: { n, edges }, result, frames }
}

export const code = `function maxNumEdgesToRemove(n, edges) {
  const pa = Array.from({ length: n + 1 }, (_, i) => i);
  const pb = Array.from({ length: n + 1 }, (_, i) => i);
  const find = (p, x) => { while (p[x] !== x) x = p[x]; return x; };
  const unite = (p, u, v) => {
    const ru = find(p, u), rv = find(p, v);
    if (ru === rv) return false;
    p[ru] = rv;
    return true;
  };
  let groupsA = n, groupsB = n;
  let kept = 0;
  const sorted = [...edges].sort((a, b) => b[0] - a[0]);
  for (const [t, u, v] of sorted) {
    if (t === 3) {
      const a = unite(pa, u, v);
      const b = unite(pb, u, v);
      if (a) groupsA--;
      if (b) groupsB--;
      if (a || b) kept++;
    } else if (t === 1) {
      if (unite(pa, u, v)) { groupsA--; kept++; }
    } else {
      if (unite(pb, u, v)) { groupsB--; kept++; }
    }
  }
  if (groupsA === 1 && groupsB === 1) return edges.length - kept;
  return -1;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_removable(n, edges):
    pa = list(range(n + 1))
    pb = list(range(n + 1))

    def find(p, x):
        while p[x] != x:
            x = p[x]
        return x

    def unite(p, u, v):
        ru, rv = find(p, u), find(p, v)
        if ru == rv:
            return False
        p[ru] = rv
        return True

    groups_a = groups_b = n
    kept = 0
    for t, u, v in sorted(edges, key=lambda e: -e[0]):
        if t == 3:
            a = unite(pa, u, v)
            b = unite(pb, u, v)
            if a:
                groups_a -= 1
            if b:
                groups_b -= 1
            if a or b:
                kept += 1
        elif t == 1:
            if unite(pa, u, v):
                groups_a -= 1
                kept += 1
        else:
            if unite(pb, u, v):
                groups_b -= 1
                kept += 1
    if groups_a == 1 and groups_b == 1:
        return len(edges) - kept
    return -1
`
