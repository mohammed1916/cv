export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || !Number.isInteger(input.n) || !Array.isArray(input.edges) || !Array.isArray(input.price)) {
    throw new Error('Use an object such as {"n": 3, "edges": [[0,1],[1,2]], "price": [1,1,1]}.')
  }
  const { n, edges, price } = input
  if (n < 1 || n > 15) throw new Error('n is an integer from 1 to 15 for the visualization.')
  if (price.length !== n || price.some(p => !Number.isInteger(p) || p < 1 || p > 100000)) throw new Error('price has n integers from 1 to 100000.')
  if (edges.length !== n - 1) throw new Error('A tree with n nodes has n - 1 edges.')
  if (edges.some(e => !Array.isArray(e) || e.length !== 2 || e.some(x => !Number.isInteger(x) || x < 0 || x >= n))) {
    throw new Error('Each edge is a pair of node labels from 0 to n - 1.')
  }
  const seen = new Set([0])
  const stack = [0]
  const adjacent = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adjacent[a].push(b); adjacent[b].push(a) }
  while (stack.length) for (const next of adjacent[stack.pop()]) if (!seen.has(next)) { seen.add(next); stack.push(next) }
  if (seen.size !== n) throw new Error('The edges must connect all nodes into one tree.')
  return { n, edges, price }
}

// For each root, the cost is the largest path price sum from the root minus the smallest.
// Prices are positive, so the smallest sum is the root alone; the code still takes the true minimum.
export function buildTrace({ n, edges, price }) {
  const input = { n, edges, price }
  const adjacent = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adjacent[a].push(b); adjacent[b].push(a) }
  const frames = [{ phase: 'start', activeLine: L('set best to zero'), root: -1, cost: 0, best: 0, message: 'Try every node as the root.' }]
  let best = 0
  for (let root = 0; root < n; root++) {
    const sums = []
    const stack = [[root, -1, price[root]]]
    while (stack.length) {
      const [node, parent, total] = stack.pop()
      sums.push(total)
      for (const next of adjacent[node]) if (next !== parent) stack.push([next, node, total + price[next]])
    }
    const cost = Math.max(...sums) - Math.min(...sums)
    best = Math.max(best, cost)
    frames.push({ phase: 'root', activeLine: L('the cost for this root'), root, cost, best, message: `Root ${root}: heaviest path ${Math.max(...sums)}, lightest ${Math.min(...sums)}, cost ${cost}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), root: -1, cost: best, best, message: `Largest cost over all roots: ${best}.` })
  return { input, result: best, frames }
}

export const code = `largest cost over all roots of the tree
  set best to zero
  for each node as the root
    walk every path that starts at the root
    record the price sum of each path
    the cost for this root is the largest sum minus the smallest sum
    if the cost for this root is above best then set best to it
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_price_cost(n, edges, price):
    adjacent = [[] for _ in range(n)]
    for a, b in edges:
        adjacent[a].append(b)
        adjacent[b].append(a)
    best = 0
    for root in range(n):
        sums = []
        stack = [(root, -1, price[root])]
        while stack:
            node, parent, total = stack.pop()
            sums.append(total)
            for nxt in adjacent[node]:
                if nxt != parent:
                    stack.append((nxt, node, total + price[nxt]))
        best = max(best, max(sums) - min(sums))
    return best
`
