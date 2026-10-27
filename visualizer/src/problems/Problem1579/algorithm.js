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
  const frames = [{ phase: 'start', activeLine: L('make two union-find structures'), edge: -1, decisions: [...decisions], groups: [...groups], kept, message: `Alice and Bob each start with ${n} separate nodes.` }]
  for (const idx of order) {
    const [t, u, v] = edges[idx]
    let line
    if (t === 3) {
      line = 'merge it in both structures'
      const a = unite(pa, u, v)
      const b = unite(pb, u, v)
      if (a) groups[0]--
      if (b) groups[1]--
      if (a || b) { kept++; decisions[idx] = 'kept' } else decisions[idx] = 'removed'
    } else if (t === 1) {
      line = 'keep it if it joins two groups in Alice'
      if (unite(pa, u, v)) { groups[0]--; kept++; decisions[idx] = 'kept' } else decisions[idx] = 'removed'
    } else {
      line = 'keep it if it joins two groups in Bob'
      if (unite(pb, u, v)) { groups[1]--; kept++; decisions[idx] = 'kept' } else decisions[idx] = 'removed'
    }
    frames.push({ phase: 'edge', activeLine: L(line), edge: idx, decisions: [...decisions], groups: [...groups], kept, message: `Edge ${idx} (type ${t}, ${u}-${v}) is ${decisions[idx]}.` })
  }
  const ok = groups[0] === 1 && groups[1] === 1
  const result = ok ? edges.length - kept : -1
  frames.push({ phase: 'done', activeLine: L('return the number of edges minus kept'), edge: -1, decisions: [...decisions], groups: [...groups], kept, message: ok ? `Both can reach every node; remove ${result} edges.` : 'Alice or Bob cannot reach every node, so the answer is -1.' })
  return { input: { n, edges }, result, frames }
}

export const code = `most edges that can be removed while Alice and Bob both still reach every node
  make two union-find structures, one for Alice and one for Bob
  set kept to 0
  for each type 3 edge, which both can use
    merge it in both structures, and keep the edge if either merge joined two groups
  for each type 1 edge, which only Alice can use, keep it if it joins two groups in Alice structure
  for each type 2 edge, which only Bob can use, keep it if it joins two groups in Bob structure
  if Alice and Bob each have one group then return the number of edges minus kept, otherwise return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
