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

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function sortItems(n, m, group, beforeItems) {', 'def sort_items(n, m, group, before_items):'],
  ['  const groups = group.map((g, i) => (g === -1 ? m + i : g))', '    groups = [g if g != -1 else m + i for i, g in enumerate(group)]'],
  ['  const itemEdges = [], groupEdges = []', '    item_edges, group_edges = [], []'],
  ['  for (let i = 0; i < n; i++) {', '    for i in range(n):'],
  ['    for (const j of beforeItems[i]) {', '        for j in before_items[i]:'],
  ['      itemEdges.push([j, i])', '            item_edges.append((j, i))'],
  ['      if (groups[j] !== groups[i]) groupEdges.push([groups[j], groups[i]])', '            if groups[j] != groups[i]: group_edges.append((groups[j], groups[i]))'],
  ['    }', ''],
  ['  }', ''],
  ['  const topo = (count, edges) => {', '    def topo(count, edges):'],
  ['    const adj = Array.from({ length: count }, () => [])', '        adj = [[] for _ in range(count)]'],
  ['    const indeg = Array(count).fill(0)', '        indeg = [0] * count'],
  ['    for (const [a, b] of edges) {', '        for a, b in edges:'],
  ['      adj[a].push(b); indeg[b]++', '            adj[a].append(b); indeg[b] += 1'],
  ['    }', ''],
  ['    const ready = []; for (let v = 0; v < count; v++) if (indeg[v] === 0) ready.push(v)', '        ready = [v for v in range(count) if indeg[v] == 0]'],
  ['    const order = []', '        order = []'],
  ['    while (ready.length) {', '        while ready:'],
  ['      ready.sort((x, y) => x - y)', '            ready.sort()'],
  ['      const v = ready.shift()', '            v = ready.pop(0)'],
  ['      order.push(v)', '            order.append(v)'],
  ['      for (const w of adj[v]) {', '            for w in adj[v]:'],
  ['        indeg[w]--', '                indeg[w] -= 1'],
  ['        if (indeg[w] === 0) ready.push(w)', '                if indeg[w] == 0: ready.append(w)'],
  ['      }', ''],
  ['    }', ''],
  ['    return order.length === count ? order : null', '        return order if len(order) == count else None'],
  ['  }', ''],
  ['  const groupOrder = topo(m + n, groupEdges)', '    group_order = topo(m + n, group_edges)'],
  ['  if (!groupOrder) return []', '    if group_order is None: return []'],
  ['  const itemOrder = topo(n, itemEdges)', '    item_order = topo(n, item_edges)'],
  ['  if (!itemOrder) return []', '    if item_order is None: return []'],
  ['  const result = []', '    result = []'],
  ['  for (const g of groupOrder) {', '    for g in group_order:'],
  ['    for (const item of itemOrder) {', '        for item in item_order:'],
  ['      if (groups[item] === g) result.push(item)', '            if groups[item] == g: result.append(item)'],
  ['    }', ''],
  ['  }', ''],
  ['  return result', '    return result'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

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

  snap('start', L('function sortItems'), P('def sort_items'), 'Start with an empty answer.')
  snap('assign', L('const groups = group.map'), P('groups = [g if'), `Items with no group get private group ids ${m} to ${m + n - 1}, after the real groups.`)
  const itemEdges = []
  const groupEdges = []
  for (let i = 0; i < n; i++) {
    for (const j of before[i]) {
      itemEdges.push([j, i])
      if (groups[j] !== groups[i]) groupEdges.push([groups[j], groups[i]])
    }
  }
  snap('graph', L('itemEdges.push'), P('item_edges.append'), `${itemEdges.length} item dependencies and ${groupEdges.length} cross-group dependencies found.`)
  const groupOrder = topo('groups', m + n, groupEdges, L('const v = ready.shift()'), P('v = ready.pop(0)'), 'Group')
  if (!groupOrder) return fail(L('if (!groupOrder)'), P('if group_order is None'), 'The groups depend on each other in a cycle, so no order exists. Return empty.')
  const itemOrder = topo('items', n, itemEdges, L('const v = ready.shift()'), P('v = ready.pop(0)'), 'Item')
  if (!itemOrder) return fail(L('if (!itemOrder)'), P('if item_order is None'), 'The items depend on each other in a cycle, so no order exists. Return empty.')
  for (const g of groupOrder) {
    for (const item of itemOrder) {
      if (groups[item] !== g) continue
      list.push(item)
      snap('emit', L('if (groups[item] === g)'), P('if groups[item] == g'), `Group ${g} contributes item ${item}.`, item)
    }
  }
  snap('done', L('return result'), P('return result'), list.length ? `Answer: [${list.join(', ')}].` : 'Answer: empty.')
  return { input, groups, result: list, frames }
}
