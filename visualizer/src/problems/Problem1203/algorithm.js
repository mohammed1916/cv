export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys n, m, group and before_items.')
  const { n, m, group, before_items: before } = input
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n must be an integer from 1 to 8.')
  if (!Number.isInteger(m) || m < 1 || m > n) throw new Error('m must be an integer from 1 to n.')
  if (!Array.isArray(group) || group.length !== n || group.some(g => !Number.isInteger(g) || g < -1 || g >= m)) throw new Error('group needs n entries, each -1 (no group) or a group id from 0 to m-1.')
  if (!Array.isArray(before) || before.length !== n) throw new Error('before_items needs one list for each of the n items.')
  before.forEach((list, i) => {
    if (!Array.isArray(list) || list.some(j => !Number.isInteger(j) || j < 0 || j >= n || j === i)) throw new Error(`before_items[${i}] must list other item indices from 0 to n-1.`)
  })
  return { n, m, group, before_items: before }
}

export function buildTrace(input) {
  const { n, m, group, before_items: before } = input
  const groups = group.map((g, i) => (g === -1 ? m + i : g))
  const frames = []
  let list = []
  const snap = (phase, activeLine, pythonLine, message, item = null) => frames.push({ phase, activeLine, pythonLine, item, groups, list: [...list], message })
  const topo = (phase, count, edges, activeLine, pythonLine, label) => {
    const adj = Array.from({ length: count }, () => [])
    const indeg = Array(count).fill(0)
    for (const [from, to] of edges) { adj[from].push(to); indeg[to]++ }
    const ready = []
    for (let v = 0; v < count; v++) if (indeg[v] === 0) ready.push(v)
    const sorted = []
    while (ready.length) {
      ready.sort((x, y) => x - y)
      const v = ready.shift()
      sorted.push(v)
      frames.push({ phase, activeLine, pythonLine, item: null, groups, list: [...sorted], message: `${label} ${v} has no unmet dependencies, so it comes next.` })
      for (const w of adj[v]) { indeg[w]--; if (indeg[w] === 0) ready.push(w) }
    }
    return sorted.length === count ? sorted : null
  }
  const fail = (activeLine, pythonLine, message) => { snap('fail', activeLine, pythonLine, message); return { input, groups, result: [], frames } }

  snap('start', L('result is an empty list'), PY('def sort_items'), 'Start with an empty answer.')
  snap('assign', L('give each item without a group'), PY('groups = ['), `Items with no group get private group ids ${m} to ${m + n - 1}, after the real groups.`)
  const itemEdges = []
  const groupEdges = []
  for (let i = 0; i < n; i++) {
    for (const j of before[i]) {
      itemEdges.push([j, i])
      if (groups[j] !== groups[i]) groupEdges.push([groups[j], groups[i]])
    }
  }
  snap('graph', L('build a graph of item dependencies'), PY('group_edges.append'), `${itemEdges.length} item dependencies and ${groupEdges.length} cross-group dependencies found.`)
  const groupOrder = topo('groups', m + n, groupEdges, L('topologically sort the groups'), PY('order.append(v)'), 'Group')
  if (!groupOrder) return fail(L('topologically sort the groups'), PY('return []', 0), 'The groups depend on each other in a cycle, so no order exists. Return empty.')
  const itemOrder = topo('items', n, itemEdges, L('topologically sort the items'), PY('order.append(v)'), 'Item')
  if (!itemOrder) return fail(L('topologically sort the items'), PY('return []', 1), 'The items depend on each other in a cycle, so no order exists. Return empty.')
  for (const g of groupOrder) {
    for (const item of itemOrder) {
      if (groups[item] !== g) continue
      list.push(item)
      snap('emit', L('add its items'), PY('result.append(item)'), `Group ${g} contributes item ${item}.`, item)
    }
  }
  snap('done', L('return the result'), PY('return result'), list.length ? `Answer: [${list.join(', ')}].` : 'Answer: empty.')
  return { input, groups, result: list, frames }
}

export const code = `result is an empty list
give each item without a group its own private group id
build a graph of item dependencies from each before list
build a graph of group dependencies for pairs in different groups
topologically sort the groups; if a cycle exists, return empty
topologically sort the items; if a cycle exists, return empty
for each group in topological group order
  add its items in topological item order to the result
return the result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sort_items(n, m, group, before_items):
    groups = [g if g != -1 else m + i for i, g in enumerate(group)]
    item_edges = []
    group_edges = []
    for i in range(n):
        for j in before_items[i]:
            item_edges.append((j, i))
            if groups[j] != groups[i]:
                group_edges.append((groups[j], groups[i]))

    def topo(count, edges):
        adj = [[] for _ in range(count)]
        indeg = [0] * count
        for a, b in edges:
            adj[a].append(b)
            indeg[b] += 1
        ready = [v for v in range(count) if indeg[v] == 0]
        order = []
        while ready:
            ready.sort()
            v = ready.pop(0)
            order.append(v)
            for w in adj[v]:
                indeg[w] -= 1
                if indeg[w] == 0:
                    ready.append(w)
        return order if len(order) == count else None

    group_order = topo(m + n, group_edges)
    if group_order is None:
        return []
    item_order = topo(n, item_edges)
    if item_order is None:
        return []
    result = []
    for g in group_order:
        for item in item_order:
            if groups[item] == g:
                result.append(item)
    return result
`

const PY = (s, nth = 0) => {
  let hits = -1
  const i = python.split('\n').findIndex(line => line.includes(s) && ++hits === nth)
  if (i < 0) throw new Error(`no Python line: ${s}`)
  return i + 1
}
