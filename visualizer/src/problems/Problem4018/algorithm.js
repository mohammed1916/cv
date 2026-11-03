const PHASES = [
  { id: 'root', label: 'Root', description: 'Root the tree at node 0 and order the nodes so children come first.' },
  { id: 'climb', label: 'Climb', description: 'Fold a node’s group counts into the subtree it tops.' },
  { id: 'edge', label: 'Edge', description: 'Count the same-group pairs that the edge to the parent separates.' },
  { id: 'done', label: 'Total', description: 'Report the summed interaction cost.' },
]

export const phases = PHASES

const CODE_LINES = [
  'total sum of interaction cost over the groups',
  'root the tree at node 0 and count each group in the whole tree',
  'order the nodes so every child comes before its parent',
  'for each node v in that order',
  '  add the node own group to its subtree counts',
  '  if v has a parent',
  '    for each group g with a = count of g in subtree of v',
  '      add a times (total of g minus a) to the answer',
  '    add the subtree counts of v into the parent',
  'return the answer',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `from collections import defaultdict

def interaction_cost(groups, edges):
    n = len(groups)
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    total = defaultdict(int)
    for g in groups:
        total[g] += 1
    parent = [-1] * n
    seen = [False] * n
    seen[0] = True
    order = []
    stack = [0]
    while stack:
        v = stack.pop()
        order.append(v)
        for w in adj[v]:
            if not seen[w]:
                seen[w] = True
                parent[w] = v
                stack.append(w)
    sub = [defaultdict(int) for _ in range(n)]
    answer = 0
    for v in reversed(order):
        sub[v][groups[v]] += 1
        if parent[v] >= 0:
            for g, a in sub[v].items():
                answer += a * (total[g] - a)
            for g, a in sub[v].items():
                sub[parent[v]][g] += a
    return answer
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with groups and edges.')
  const { groups, edges } = input
  if (!Array.isArray(groups) || groups.length < 1 || groups.length > 12) throw new Error('groups has 1 to 12 integer labels.')
  if (!groups.every(g => Number.isInteger(g) && g >= 1 && g <= 9)) throw new Error('Each group label is an integer from 1 to 9.')
  const n = groups.length
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('A tree on n nodes has n minus 1 edges.')
  const adj = Array.from({ length: n }, () => [])
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(v => Number.isInteger(v) && v >= 0 && v < n) || e[0] === e[1]) {
      throw new Error('Each edge is a pair of different node indices.')
    }
    adj[e[0]].push(e[1])
    adj[e[1]].push(e[0])
  }
  const seen = new Set([0])
  const stack = [0]
  while (stack.length) for (const w of adj[stack.pop()]) if (!seen.has(w)) { seen.add(w); stack.push(w) }
  if (seen.size !== n) throw new Error('The edges must connect every node.')
  return { groups, edges }
}

export function buildTrace({ groups, edges }) {
  const n = groups.length
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const total = new Map()
  for (const g of groups) total.set(g, (total.get(g) || 0) + 1)
  const parent = Array(n).fill(-1)
  const seen = Array(n).fill(false)
  seen[0] = true
  const order = []
  const stack = [0]
  while (stack.length) {
    const v = stack.pop()
    order.push(v)
    for (const w of adj[v]) if (!seen[w]) { seen[w] = true; parent[w] = v; stack.push(w) }
  }
  const frames = []
  const sub = Array.from({ length: n }, () => new Map())
  const finished = []
  let answer = 0
  const snapshot = () => sub.map(m => Object.fromEntries(m))
  frames.push({ pythonLine: P('def interaction_cost'), phase: 'root', activeLine: L('root the tree'), node: 0, parent: -1, order: [...order], finished: [], contribution: 0, answer: 0, subtree: null, message: `Rooted at node 0; the visit order puts children before parents.` })
  for (const v of [...order].reverse()) {
    sub[v].set(groups[v], (sub[v].get(groups[v]) || 0) + 1)
    frames.push({ pythonLine: P('sub[v][groups[v]] += 1'), phase: 'climb', activeLine: L('add the node own group'), node: v, parent: parent[v], order: [...order], finished: [...finished], contribution: 0, answer, subtree: snapshot(), message: `Node ${v} (group ${groups[v]}) joins its own subtree counts.` })
    if (parent[v] >= 0) {
      let contribution = 0
      for (const [g, a] of sub[v]) contribution += a * (total.get(g) - a)
      answer += contribution
      frames.push({ pythonLine: P('answer += a * (total[g] - a)'), phase: 'edge', activeLine: L('add a times'), node: v, parent: parent[v], order: [...order], finished: [...finished], contribution, answer, subtree: snapshot(), message: `The edge ${v}-${parent[v]} separates ${contribution} same-group pair${contribution === 1 ? '' : 's'}.` })
      for (const [g, a] of sub[v]) sub[parent[v]].set(g, (sub[parent[v]].get(g) || 0) + a)
    }
    finished.push(v)
  }
  frames.push({ pythonLine: P('return answer'), phase: 'done', activeLine: L('return the answer'), node: -1, parent: -1, order: [...order], finished: [...finished], contribution: 0, answer, subtree: snapshot(), message: `Total interaction cost is ${answer}.` })
  return { input: { groups, edges }, result: answer, frames }
}
