export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.pairs) || data.pairs.length < 1 || data.pairs.length > 20) throw new Error('Use pairs as an array of 1 to 20 [x, y] pairs.')
  const seen = new Set()
  for (const p of data.pairs) {
    if (!Array.isArray(p) || p.length !== 2 || !Number.isInteger(p[0]) || !Number.isInteger(p[1]) || p[0] < 1 || p[1] > 500 || p[0] >= p[1]) {
      throw new Error('Each pair is [x, y] with integers from 1 to 500 and x less than y.')
    }
    const key = `${p[0]}-${p[1]}`
    if (seen.has(key)) throw new Error('Pairs must not repeat.')
    seen.add(key)
  }
  if (new Set(data.pairs.flat()).size > 8) throw new Error('Use at most 8 distinct values.')
  return { pairs: data.pairs }
}

const key = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`

export function buildTrace({ pairs }) {
  const adj = new Map()
  const link = (a, b) => { if (!adj.has(a)) adj.set(a, new Set()); adj.get(a).add(b) }
  for (const [x, y] of pairs) { link(x, y); link(y, x) }
  const nodes = [...adj.keys()].sort((a, b) => a - b)
  const parent = new Map()
  let ways = 1
  let valid = true
  const links = () => [...parent].map(([child, above]) => [child, above])
  const frames = [{ phase: 'start', activeLine: L('build a related-pairs graph'), group: nodes, universal: [], links: [], ways, result: null, message: `Values in the pairs: ${nodes.join(', ')}.` }]
  const solve = (group, above) => {
    const members = new Set(group)
    const universal = group.filter(v => [...adj.get(v)].filter(w => members.has(w)).length === group.length - 1)
    frames.push({ phase: 'group', activeLine: L('find the nodes related to every other node'), group, universal, links: links(), ways, result: null, message: `In ${group.join(', ')}, related to every other member: ${universal.join(', ') || 'none'}.` })
    if (universal.length === 0) {
      valid = false
      frames.push({ phase: 'zero', activeLine: L('if there are none'), group, universal, links: links(), ways, result: null, message: 'No value is related to all the others here, so no tree fits.' })
      return
    }
    if (universal.length >= 2) {
      ways = 2
      frames.push({ phase: 'group', activeLine: L('if there are two or more'), group, universal, links: links(), ways, result: null, message: 'Two or more can be stacked in either order, so there is more than one tree.' })
    }
    let bottom = above
    for (const u of universal) { parent.set(u, bottom); bottom = u }
    frames.push({ phase: 'chain', activeLine: L('stack these nodes'), group, universal, links: links(), ways, result: null, message: `Stack ${universal.join(', ')} as a chain below ${above === null ? 'the root' : above}.` })
    const rest = group.filter(v => !universal.includes(v))
    const restSet = new Set(rest)
    const seen = new Set()
    for (const v of rest) {
      if (seen.has(v)) continue
      const part = []
      const stack = [v]
      seen.add(v)
      while (stack.length) {
        const x = stack.pop()
        part.push(x)
        for (const w of adj.get(x)) if (restSet.has(w) && !seen.has(w)) { seen.add(w); stack.push(w) }
      }
      part.sort((a, b) => a - b)
      frames.push({ phase: 'split', activeLine: L('split the rest of the group'), group: part, universal: [], links: links(), ways, result: null, message: `Unrelated part ${part.join(', ')} hangs below the chain.` })
      solve(part, bottom)
      if (!valid) return
    }
  }
  solve(nodes, null)
  if (valid) {
    const related = new Set()
    for (const v of nodes) {
      let p = parent.get(v) ?? null
      while (p !== null) { related.add(key(v, p)); p = parent.get(p) ?? null }
    }
    const wanted = new Set(pairs.map(([x, y]) => key(x, y)))
    valid = related.size === wanted.size && [...wanted].every(k => related.has(k))
  }
  const result = valid ? Math.min(ways, 2) : 0
  frames.push({ phase: 'done', activeLine: L('capped at two'), group: [], universal: [], links: links(), ways, result, message: `Ways to reconstruct: ${result}.` })
  return { input: { pairs }, result, frames }
}

export const code = `count the ways to reconstruct a rooted tree from the pairs
  build a related-pairs graph from the pairs
  solve for all nodes, with no parent above them
  for a group of nodes, find the nodes related to every other node in the group
  if there are none then the answer is zero
  if there are two or more then they can be stacked in any order, so there is more than one tree
  stack these nodes as a chain below the parent above them
  split the rest of the group into parts that are not related to each other
  solve each part below the bottom of the chain
  verify that the tree relates exactly the given pairs, otherwise the answer is zero
  return the answer, capped at two`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_tree_reconstructions(pairs):
    adj = {}
    for x, y in pairs:
        adj.setdefault(x, set()).add(y)
        adj.setdefault(y, set()).add(x)
    parent = {}
    state = {'ways': 1}

    def solve(group, above):
        members = set(group)
        universal = [v for v in group if len(adj[v] & members) == len(group) - 1]
        if not universal:
            return False
        if len(universal) >= 2:
            state['ways'] = 2
        bottom = above
        for u in universal:
            parent[u] = bottom
            bottom = u
        universal_set = set(universal)
        rest = [v for v in group if v not in universal_set]
        rest_set = set(rest)
        seen = set()
        for v in rest:
            if v in seen:
                continue
            part = []
            stack = [v]
            seen.add(v)
            while stack:
                x = stack.pop()
                part.append(x)
                for w in adj[x]:
                    if w in rest_set and w not in seen:
                        seen.add(w)
                        stack.append(w)
            if not solve(part, bottom):
                return False
        return True

    nodes = sorted(adj)
    if not solve(nodes, None):
        return 0
    related = set()
    for v in nodes:
        p = parent.get(v)
        while p is not None:
            related.add(frozenset((v, p)))
            p = parent.get(p)
    wanted = {frozenset(pair) for pair in map(tuple, pairs)}
    if related != wanted:
        return 0
    return min(state['ways'], 2)
`
