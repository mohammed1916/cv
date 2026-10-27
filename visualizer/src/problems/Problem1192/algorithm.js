export function parseInput(text) {
  const input = JSON.parse(text)
  const err = 'Enter {"n": 2 to 12, "connections": [[u, v], ...]}: nodes 0 to n-1, no self-loops, no repeated edges, and the network must be connected.'
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n) || input.n < 2 || input.n > 12 || !Array.isArray(input.connections)) throw new Error(err)
  const { n } = input
  const seen = new Set()
  for (const edge of input.connections) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(Number.isInteger)) throw new Error(err)
    const [u, v] = edge
    if (u < 0 || v < 0 || u >= n || v >= n || u === v) throw new Error(err)
    const key = `${Math.min(u, v)},${Math.max(u, v)}`
    if (seen.has(key)) throw new Error(err)
    seen.add(key)
  }
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of input.connections) { adj[u].push(v); adj[v].push(u) }
  const reached = new Set([0]), queue = [0]
  for (let i = 0; i < queue.length; i++) for (const v of adj[queue[i]]) if (!reached.has(v)) { reached.add(v); queue.push(v) }
  if (reached.size !== n) throw new Error(err)
  return { n, connections: input.connections.map(([u, v]) => [u, v]) }
}

export function buildTrace(input) {
  const { n, connections } = input
  const graph = Array.from({ length: n }, () => [])
  for (const [u, v] of connections) { graph[u].push(v); graph[v].push(u) }
  const disc = Array(n).fill(-1), low = Array(n).fill(-1)
  const stack = [], finished = [], bridges = []
  let timer = 0
  const snap = extra => ({ disc: [...disc], low: [...low], stack: [...stack], finished: [...finished], bridges: bridges.map(b => [...b]), timer, ...extra })
  const frames = [snap({ phase: 'start', activeLine: L('set timer to 0'), u: -1, v: -1, message: 'Start one depth-first search at node 0. disc is the visit time; low is the earliest discovery time reachable by going down tree edges and then taking at most one back edge.' })]
  const visit = (u, parent) => {
    disc[u] = low[u] = timer++
    stack.push(u)
    frames.push(snap({ phase: 'enter', activeLine: L('set disc[u]'), u, v: -1, message: `Visit node ${u}: disc and low both start at ${disc[u]}.` }))
    for (const v of graph[u]) {
      if (v === parent) {
        frames.push(snap({ phase: 'parent', activeLine: L('if v is parent'), u, v, message: `Edge ${u}-${v} leads back to the parent ${v}, so it is skipped.` }))
        continue
      }
      if (disc[v] === -1) {
        frames.push(snap({ phase: 'descend', activeLine: L('call visit(v, u)'), u, v, message: `Node ${v} is unseen, so follow tree edge ${u}-${v} down.` }))
        visit(v, u)
        low[u] = Math.min(low[u], low[v])
        frames.push(snap({ phase: 'return', activeLine: L('set low[u] to the smaller of low[u] and low[v]'), u, v, message: `Back at ${u} from ${v}: low[${u}] becomes ${low[u]}.` }))
        if (low[v] > disc[u]) {
          bridges.push([Math.min(u, v), Math.max(u, v)])
          frames.push(snap({ phase: 'bridge', activeLine: L('if low[v] is greater'), u, v, message: `low[${v}] = ${low[v]} is greater than disc[${u}] = ${disc[u]}: nothing in ${v}'s subtree reaches ${u} or above, so edge ${u}-${v} is a bridge.` }))
        }
      } else {
        low[u] = Math.min(low[u], disc[v])
        frames.push(snap({ phase: 'back', activeLine: L('set low[u] to the smaller of low[u] and disc[v]'), u, v, message: `Node ${v} is already visited, so edge ${u}-${v} is a back edge: low[${u}] becomes ${low[u]}.` }))
      }
    }
    stack.pop()
    finished.push(u)
    frames.push(snap({ phase: 'finish', activeLine: L('for each neighbour'), u, v: -1, message: `All neighbours of ${u} are handled; node ${u} is finished.` }))
  }
  visit(0, -1)
  bridges.sort((x, y) => x[0] - y[0] || x[1] - y[1])
  frames.push(snap({ phase: 'done', activeLine: L('return bridges'), u: -1, v: -1, message: `Bridges: ${bridges.map(([a, b]) => `${a}-${b}`).join(', ') || 'none'}.` }))
  return { input: { n, connections }, result: bridges.map(b => [...b]), frames }
}

export const code = `critical connections of an n-node connected network:
  build an undirected adjacency list from connections
  set timer to 0; set disc[i] to unseen for every node; bridges to empty
  call visit on node 0 with no parent
  return bridges

visit(u, parent):
  set disc[u] and low[u] to timer, then add 1 to timer
  for each neighbour v of u:
    if v is parent then skip v
    else if disc[v] is unseen then
      call visit(v, u)
      set low[u] to the smaller of low[u] and low[v]
      if low[v] is greater than disc[u] then add edge u-v to bridges
    else
      set low[u] to the smaller of low[u] and disc[v]`.split('\n').map((text, index) => ({ line: index + 1, text }))
function L(s) { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`no pseudocode line: ${s}`); return i + 1 }

export const python = `def critical_connections(n, connections):
    graph = [[] for _ in range(n)]
    for u, v in connections:
        graph[u].append(v)
        graph[v].append(u)
    disc = [-1] * n
    low = [0] * n
    timer = 0
    bridges = []

    def visit(u, parent):
        nonlocal timer
        disc[u] = low[u] = timer
        timer += 1
        for v in graph[u]:
            if v == parent:
                continue
            if disc[v] == -1:
                visit(v, u)
                low[u] = min(low[u], low[v])
                if low[v] > disc[u]:
                    bridges.append([min(u, v), max(u, v)])
            else:
                low[u] = min(low[u], disc[v])

    visit(0, -1)
    return sorted(bridges)
`
