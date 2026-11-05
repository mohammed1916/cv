export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.vals) || !Array.isArray(input.edges)) throw new Error('Use an object with vals and edges.')
  const { vals, edges } = input
  const n = vals.length
  if (n < 1 || n > 10) throw new Error('vals has 1 to 10 nodes.')
  if (!vals.every(v => Number.isInteger(v) && v >= 0 && v <= 5)) throw new Error('Each value is an integer from 0 to 5.')
  if (edges.length !== n - 1) throw new Error('A tree on n nodes has n - 1 edges.')
  const seen = new Set()
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : find(parent[x]))
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(v => Number.isInteger(v) && v >= 0 && v < n) || e[0] === e[1]) throw new Error('Each edge joins two different nodes.')
    if (find(e[0]) === find(e[1])) throw new Error('The edges must form a tree.')
    parent[find(e[0])] = find(e[1])
    seen.add(e.join('-'))
  }
  return { vals, edges }
}

export function buildTrace({ vals, edges }) {
  const n = vals.length
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const groups = Array.from({ length: n }, (_, i) => new Map([[vals[i], 1]]))
  const sorted = edges.map(e => e.slice()).sort((a, b) => Math.max(vals[a[0]], vals[a[1]]) - Math.max(vals[b[0]], vals[b[1]]))
  let count = n
  const frames = []
  frames.push({ phase: 'setup', activeLine: CL('let count = n'), pythonLine: PL('count = n'), edge: null, count, groups: groups.map(m => [...m.entries()]), message: `Every single node is a good path: ${n} so far. Sort the edges by their larger endpoint value.` })
  for (const [a, b] of sorted) {
    const ra = find(a), rb = find(b)
    const top = Math.max(vals[a], vals[b])
    if (ra === rb) continue
    let added = 0
    for (const [v, c] of groups[ra]) {
      if (groups[rb].has(v) && v === top) added += c * groups[rb].get(v)
    }
    count += added
    let big = ra, small = rb
    if (groups[small].size > groups[big].size) [big, small] = [small, big]
    for (const [v, c] of groups[small]) groups[big].set(v, (groups[big].get(v) ?? 0) + c)
    parent[small] = big
    frames.push({ phase: 'join', activeLine: CL('count += added'), pythonLine: PL('count +='), edge: [a, b], count, groups: groups.map(m => [...m.entries()]), message: `Join ${a} and ${b} at level ${top}. ${added ? `${added} pair${added === 1 ? '' : 's'} with value ${top} become good.` : 'No pair shares the top value.'}` })
  }
  frames.push({ phase: 'done', activeLine: CL('return count'), pythonLine: PL('return count'), edge: null, count, groups: groups.map(m => [...m.entries()]), message: `${count} distinct good paths.` })
  return { input: { vals, edges }, result: count, frames }
}

export const code = `function countGoodPaths(vals, edges) {
  const n = vals.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const groups = Array.from({ length: n }, (_, i) => new Map([[vals[i], 1]]));
  const sorted = edges.slice().sort((a, b) => Math.max(vals[a[0]], vals[a[1]]) - Math.max(vals[b[0]], vals[b[1]]));
  let count = n;
  for (const [a, b] of sorted) {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) continue;
    const top = Math.max(vals[a], vals[b]);
    let added = 0;
    for (const [v, c] of groups[ra]) {
      if (v === top && groups[rb].has(v)) added += c * groups[rb].get(v);
    }
    count += added;
    let big = ra;
    let small = rb;
    if (groups[small].size > groups[big].size) [big, small] = [small, big];
    for (const [v, c] of groups[small]) groups[big].set(v, (groups[big].get(v) ?? 0) + c);
    parent[small] = big;
  }
  return count;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def count_good_paths(vals, edges):
    n = len(vals)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    groups = [{vals[i]: 1} for i in range(n)]
    count = n
    for a, b in sorted(edges, key=lambda e: max(vals[e[0]], vals[e[1]])):
        ra, rb = find(a), find(b)
        if ra == rb:
            continue
        top = max(vals[a], vals[b])
        added = 0
        if top in groups[ra] and top in groups[rb]:
            added = groups[ra][top] * groups[rb][top]
        count += added
        big, small = ra, rb
        if len(groups[small]) > len(groups[big]):
            big, small = small, big
        for v, c in groups[small].items():
            groups[big][v] = groups[big].get(v, 0) + c
        parent[small] = big
    return count
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
