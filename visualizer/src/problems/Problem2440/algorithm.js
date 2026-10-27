export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums and edges.')
  const { nums, edges } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('nums has 1 to 10 integers from 1 to 9.')
  const n = nums.length
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error(`edges must list exactly ${n - 1} pairs for a tree on ${n} vertices.`)
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = v => (parent[v] === v ? v : (parent[v] = find(parent[v])))
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 0 && v < n)) throw new Error('Each edge is a pair of vertices from 0 to n-1.')
    const [a, b] = edge
    if (find(a) === find(b)) throw new Error('The edges must form a tree: no cycles and no repeated edges.')
    parent[find(a)] = find(b)
  }
  return { nums, edges }
}

export function buildTrace(input) {
  const { nums, edges } = input
  const n = nums.length
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const parent = Array(n).fill(-1)
  const order = []
  const seen = Array(n).fill(false)
  seen[0] = true
  const stack = [0]
  while (stack.length) {
    const v = stack.pop()
    order.push(v)
    for (const w of adj[v]) if (!seen[w]) { seen[w] = true; parent[w] = v; stack.push(w) }
  }
  const total = nums.reduce((sum, v) => sum + v, 0)
  const frames = []
  let k = null, target = null, cuts = 0, left = [...nums], cutNodes = [], node = null
  const frame = (phase, line, message) => frames.push({ phase, activeLine: line, node, k, target, cuts, left: [...left], cutNodes: [...cutNodes], message })
  frame('start', L('set total to the sum'), `The total value is ${total}. Try splits into k equal parts, from the most parts down.`)
  let answer = 0
  let found = false
  for (let count = n; count >= 1 && !found; count--) {
    k = count
    if (total % count !== 0) {
      target = null
      node = null
      frame('skip', L('skip k when'), `${count} parts cannot have equal sums, because ${total} is not divisible by ${count}.`)
      continue
    }
    target = total / count
    left = [...nums]
    cuts = 0
    cutNodes = []
    node = null
    frame('try', L('set target to'), `Each of the ${count} parts must sum to ${target}.`)
    let ok = true
    for (const v of [...order].reverse()) {
      node = v
      if (left[v] === target) {
        frame('cut', L('if left value of vertex equals target'), `Vertex ${v} closes a part worth ${target}. Cut the edge above it.`)
        cuts++
        cutNodes.push(v)
        left[v] = 0
      } else if (left[v] > target) {
        ok = false
        frame('fail', L('if left value of vertex exceeds target'), `Vertex ${v} carries ${left[v]}, more than ${target}, so this split fails.`)
        break
      }
      if (parent[v] >= 0) left[parent[v]] += left[v]
    }
    if (ok && cuts === count) {
      found = true
      answer = count - 1
      node = null
      frame('found', L('return k minus 1'), `${count} equal parts of ${target}, so ${count - 1} edges can be deleted.`)
    }
  }
  if (!found) {
    node = null
    frame('done', L('return 0'), 'No split works, so no edge can be deleted.')
  }
  return { input, result: answer, frames }
}

export const code = `maximum number of edges that can be deleted
  build a neighbour list and order vertices so parents come first
  set total to the sum of all values
  for each count k from n down to 1, do
    skip k when total is not divisible by k
    set target to total divided by k
    if try split with k and target succeeds then
      return k minus 1
  return 0

try split(k, target): set left to a copy of the values and cuts to 0
  for each vertex from last to first in the order, do
    if left value of vertex equals target then add 1 to cuts and clear it
    if left value of vertex exceeds target then return false
    add left value of vertex to the left value of its parent
  return cuts equals k`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_deleted_edges(nums, edges):
    n = len(nums)
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    total = sum(nums)
    parent = [-1] * n
    order = []
    seen = [False] * n
    seen[0] = True
    stack = [0]
    while stack:
        v = stack.pop()
        order.append(v)
        for w in adj[v]:
            if not seen[w]:
                seen[w] = True
                parent[w] = v
                stack.append(w)
    for k in range(n, 0, -1):
        if total % k:
            continue
        target = total // k
        left = list(nums)
        cuts = 0
        ok = True
        for v in reversed(order):
            if left[v] == target:
                cuts += 1
                left[v] = 0
            elif left[v] > target:
                ok = False
                break
            if parent[v] >= 0:
                left[parent[v]] += left[v]
        if ok and cuts == k:
            return k - 1
    return 0
`
