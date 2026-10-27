export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys coins and edges.')
  const { coins, edges } = input
  if (!Array.isArray(coins) || coins.length < 1 || coins.length > 8 || coins.some(c => c !== 0 && c !== 1)) {
    throw new Error('coins is a list of 1 to 8 entries, each 0 or 1.')
  }
  const n = coins.length
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges needs exactly n-1 pairs for n coins.')
  const adj = Array.from({ length: n }, () => [])
  edges.forEach((pair, i) => {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some(v => !Number.isInteger(v) || v < 0 || v >= n) || pair[0] === pair[1]) {
      throw new Error(`edges[${i}] must be two different nodes from 0 to n-1.`)
    }
    adj[pair[0]].push(pair[1])
    adj[pair[1]].push(pair[0])
  })
  const seen = Array(n).fill(false)
  const queue = [0]
  seen[0] = true
  for (let h = 0; h < queue.length; h++) {
    for (const u of adj[queue[h]]) if (!seen[u]) { seen[u] = true; queue.push(u) }
  }
  if (queue.length !== n) throw new Error('edges must connect every node into one tree.')
  return { coins, edges }
}

export function buildTrace(input) {
  const { coins, edges } = input
  const n = coins.length
  const adj = Array.from({ length: n }, () => new Set())
  for (const [a, b] of edges) { adj[a].add(b); adj[b].add(a) }
  const alive = Array(n).fill(true)
  const frames = []
  let current = -1
  const snap = (phase, activeLine, message) => frames.push({ phase, activeLine, current, alive: [...alive], message })
  const bareLeaf = v => alive[v] && adj[v].size === 1 && coins[v] === 0
  const removeNode = v => {
    alive[v] = false
    for (const u of adj[v]) adj[u].delete(v)
    adj[v].clear()
  }

  snap('start', L('build the neighbor set'), 'Each node knows its neighbors. Coins are 1.')
  const queue = []
  for (let v = 0; v < n; v++) if (bareLeaf(v)) queue.push(v)
  snap('leaves', L('remove each leaf without a coin'), `${queue.length} leaf node(s) without a coin are queued.`)
  while (queue.length) {
    const v = queue.shift()
    current = v
    if (!bareLeaf(v)) continue
    const [u] = adj[v]
    removeNode(v)
    snap('prune', L('remove each leaf without a coin'), `Remove leaf ${v}; its neighbor is ${u}.`)
    if (bareLeaf(u)) {
      queue.push(u)
      snap('leaves', L('and any leaf it exposes'), `Node ${u} is now a leaf without a coin, so it is queued.`)
    }
  }
  for (let layer = 0; layer < 2; layer++) {
    const leaves = []
    for (let v = 0; v < n; v++) if (alive[v] && adj[v].size <= 1) leaves.push(v)
    for (const v of leaves) removeNode(v)
    current = -1
    snap('layer', L('remove all current leaves'), `Layer ${layer + 1}: removed [${leaves.join(', ')}].`)
  }
  const r = alive.filter(Boolean).length
  snap('count', L('count the nodes left'), `${r} node(s) remain.`)
  const result = 2 * Math.max(0, r - 1)
  snap('done', L('return twice'), `Answer: ${result}.`)
  return { input, alive, result, frames }
}

export const code = `build the neighbor set of each node
remove each leaf without a coin, and any leaf it exposes, until none is left
repeat two times: remove all current leaves at once
count the nodes left, as r
return twice (r minus 1), or zero when r is 0 or 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def collect_coins(coins, edges):
    n = len(coins)
    adj = [set() for _ in range(n)]
    for a, b in edges:
        adj[a].add(b)
        adj[b].add(a)
    alive = [True] * n

    def bare_leaf(v):
        return alive[v] and len(adj[v]) == 1 and coins[v] == 0

    def remove(v):
        alive[v] = False
        for u in adj[v]:
            adj[u].discard(v)
        adj[v].clear()

    queue = deque(v for v in range(n) if bare_leaf(v))
    while queue:
        v = queue.popleft()
        if not bare_leaf(v):
            continue
        (u,) = adj[v]
        remove(v)
        if bare_leaf(u):
            queue.append(u)
    for _ in range(2):
        layer = [v for v in range(n) if alive[v] and len(adj[v]) <= 1]
        for v in layer:
            remove(v)
    remaining = sum(alive)
    return 2 * max(0, remaining - 1)
`
