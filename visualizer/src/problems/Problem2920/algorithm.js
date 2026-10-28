export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || !Number.isInteger(input.n) || !Array.isArray(input.edges) || !Array.isArray(input.coins) || !Number.isInteger(input.k)) {
    throw new Error('Use an object such as {"n": 4, "edges": [[0,1],[1,2],[2,3]], "coins": [10,10,3,3], "k": 5}.')
  }
  const { n, edges, coins, k } = input
  if (n < 2 || n > 15) throw new Error('n is an integer from 2 to 15 for the visualization.')
  if (coins.length !== n || coins.some(c => !Number.isInteger(c) || c < 0 || c > 10000)) throw new Error('coins has n integers from 0 to 10000.')
  if (k < 0 || k > 10000) throw new Error('k is an integer from 0 to 10000.')
  if (edges.length !== n - 1) throw new Error('A tree with n nodes has n - 1 edges.')
  if (edges.some(e => !Array.isArray(e) || e.length !== 2 || e.some(x => !Number.isInteger(x) || x < 0 || x >= n))) {
    throw new Error('Each edge is a pair of node labels from 0 to n - 1.')
  }
  const adjacent = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adjacent[a].push(b); adjacent[b].push(a) }
  const seen = new Set([0])
  const stack = [0]
  while (stack.length) for (const next of adjacent[stack.pop()]) if (!seen.has(next)) { seen.add(next); stack.push(next) }
  if (seen.size !== n) throw new Error('The edges must connect all nodes into one tree.')
  return { n, edges, coins, k }
}

// Taking a node "the first way" scores coins - k. Taking it "the second way" scores half of the
// current coins and halves the coins of every node below it. h counts such halvings above a node.
export function buildTrace({ n, edges, coins, k }) {
  const input = { n, edges, coins, k }
  const adjacent = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adjacent[a].push(b); adjacent[b].push(a) }
  const children = Array.from({ length: n }, () => [])
  const order = [0]
  const seen = new Set([0])
  for (let q = 0; q < order.length; q++) {
    for (const next of adjacent[order[q]]) {
      if (seen.has(next)) continue
      seen.add(next)
      children[order[q]].push(next)
      order.push(next)
    }
  }
  const memo = new Map()
  const best = (v, h) => {
    const key = `${v}:${h}`
    if (memo.has(key)) return memo.get(key)
    const cur = Math.floor(coins[v] / 2 ** h)
    let below = 0
    let belowHalved = 0
    for (const c of children[v]) { below += best(c, h); belowHalved += best(c, h + 1) }
    const value = Math.max(cur - k + below, Math.floor(cur / 2) + belowHalved)
    memo.set(key, value)
    return value
  }
  const result = best(0, 0)
  const frames = [{ phase: 'start', activeLine: L('set answer to best'), node: -1, halvings: 0, total: 0, message: 'Start at the root with no halvings above it.' }]
  // Walk the optimal choices from the root, one frame per node.
  const walk = (v, h) => {
    const cur = Math.floor(coins[v] / 2 ** h)
    let below = 0
    let belowHalved = 0
    for (const c of children[v]) { below += best(c, h); belowHalved += best(c, h + 1) }
    const keep = cur - k + below
    const halve = Math.floor(cur / 2) + belowHalved
    const halveNow = halve > keep
    frames.push({ phase: halveNow ? 'halve' : 'keep', activeLine: L('take the better of the two ways'), node: v, halvings: h, total: Math.max(keep, halve), message: halveNow ? `Node ${v} halves: it scores ${Math.floor(cur / 2)} and halves every coin count below it.` : `Node ${v} keeps: it scores ${cur} minus k.` })
    for (const c of children[v]) walk(c, halveNow ? h + 1 : h)
  }
  walk(0, 0)
  frames.push({ phase: 'done', activeLine: L('return answer'), node: -1, halvings: 0, total: result, message: `Maximum points: ${result}.` })
  return { input, result, frames }
}

export const code = `maximum points after collecting every node
  build the tree from the root 0
  define best(v, h) as the largest total for the subtree of v
    where h is the number of halvings above v
    cur is the coins of v after h halvings
    the first way gives cur minus k plus the best of each child with h
    the second way gives half of cur plus the best of each child with h + 1
  take the better of the two ways
  set answer to best(root, 0)
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_points_after_collecting(n, edges, coins, k):
    from functools import lru_cache

    children = [[] for _ in range(n)]
    adjacent = [[] for _ in range(n)]
    for a, b in edges:
        adjacent[a].append(b)
        adjacent[b].append(a)
    seen = {0}
    order = [0]
    for v in order:
        for nxt in adjacent[v]:
            if nxt not in seen:
                seen.add(nxt)
                children[v].append(nxt)
                order.append(nxt)

    @lru_cache(maxsize=None)
    def best(v, h):
        cur = coins[v] >> h
        keep = cur - k + sum(best(c, h) for c in children[v])
        halve = (cur // 2) + sum(best(c, h + 1) for c in children[v])
        return max(keep, halve)

    return best(0, 0)
`
