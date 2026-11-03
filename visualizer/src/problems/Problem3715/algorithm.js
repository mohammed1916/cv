const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

// Two positive integers multiply to a perfect square exactly when their square-free parts match.
export function squareFreePart(value) {
  let x = value
  let result = 1
  for (let d = 2; d * d <= x; d++) {
    let exponent = 0
    while (x % d === 0) { x /= d; exponent++ }
    if (exponent % 2) result *= d
  }
  return result * x
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges and nums.')
  const { n, edges, nums } = input
  if (!Number.isInteger(n) || n < 1 || n > 20) throw new Error('n is an integer from 1 to 20.')
  if (!Array.isArray(nums) || nums.length !== n || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('nums has n integers from 1 to 1000.')
  if (!Array.isArray(edges) || edges.length !== n - 1 || !edges.every(e => Array.isArray(e) && e.length === 2 && e.every(v => Number.isInteger(v) && v >= 0 && v < n))) throw new Error('edges lists n - 1 pairs of node numbers.')
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const seen = new Set([0])
  const queue = [0]
  while (queue.length) {
    const node = queue.shift()
    for (const next of adj[node]) if (!seen.has(next)) { seen.add(next); queue.push(next) }
  }
  if (seen.size !== n) throw new Error('edges must connect every node to node 0.')
  return { n, edges, nums }
}

export function buildTrace({ n, edges, nums }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const kern = nums.map(squareFreePart)
  const count = new Map()
  const frames = []
  let total = 0
  const visit = (node, parent) => {
    const t = node === 0 ? 0 : (count.get(kern[node]) || 0)
    if (node !== 0) total += t
    frames.push({ pythonLine: PY('total += count'), phase: 'walk', activeLine: L('ancestors'), node, kernel: kern[node], t, total,
      message: node === 0 ? 'Root 0 has no ancestors and adds nothing.' : `Node ${node} has ${t} ancestor${t === 1 ? '' : 's'} with square-free part ${kern[node]}.` })
    count.set(kern[node], (count.get(kern[node]) || 0) + 1)
    for (const next of adj[node]) if (next !== parent) visit(next, node)
    count.set(kern[node], count.get(kern[node]) - 1)
  }
  visit(0, -1)
  frames.push({ pythonLine: PY('return total'), phase: 'done', activeLine: L('return'), node: -1, kernel: null, t: 0, total,
    message: `Sum of the counts is ${total}.` })
  return { input: { n, edges, nums }, result: total, frames }
}

export const code = [
  'sum of perfect-square ancestor counts in a rooted tree',
  '  replace each value by its square-free part',
  '  walk from the root, counting square-free parts on the current path',
  '  at each non-root node add the ancestors with the same part',
  '  return the total',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def sum_perfect_square_ancestors(n, edges, nums):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    kern = [square_free_part(x) for x in nums]
    count = {}
    total = 0

    def visit(node, parent):
        nonlocal total
        if node != 0:
            total += count.get(kern[node], 0)
        count[kern[node]] = count.get(kern[node], 0) + 1
        for nxt in adj[node]:
            if nxt != parent:
                visit(nxt, node)
        count[kern[node]] -= 1

    visit(0, -1)
    return total

def square_free_part(x):
    result = 1
    d = 2
    while d * d <= x:
        exponent = 0
        while x % d == 0:
            x //= d
            exponent += 1
        if exponent % 2:
            result *= d
        d += 1
    return result * x
`
