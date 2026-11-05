const PY = [
  "def countGoodNodes(edges):",
  "    n = len(edges) + 1",
  "    adj = [[] for _ in range(n)]",
  "    for u, v in edges:",
  "        adj[u].append(v)",
  "        adj[v].append(u)",
  "    parent = [-1] * n",
  "    order = []",
  "    visited = [False] * n",
  "    visited[0] = True",
  "    stack = [0]",
  "    while stack:",
  "        node = stack.pop()",
  "        order.append(node)",
  "        for nxt in adj[node]:",
  "            if not visited[nxt]:",
  "                visited[nxt] = True",
  "                parent[nxt] = node",
  "                stack.append(nxt)",
  "    size = [1] * n",
  "    good = 0",
  "    for node in reversed(order):",
  "        child_sizes = set()",
  "        for child in adj[node]:",
  "            if child != parent[node]:",
  "                size[node] += size[child]",
  "                child_sizes.add(size[child])",
  "        if len(child_sizes) <= 1:",
  "            good += 1",
  "    return good",
]

export const python = PY.join("\n")
const at = text => PY.findIndex(line => line.includes(text)) + 1

export const code = `function countGoodNodes(edges) {
  const n = edges.length + 1
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const parent = Array(n).fill(-1)
  const visited = Array(n).fill(false)
  const order = []
  const stack = [0]
  visited[0] = true
  while (stack.length) {
    const node = stack.pop()
    order.push(node)
    for (const next of adj[node]) if (!visited[next]) { visited[next] = true; parent[next] = node; stack.push(next) }
  }
  const size = Array(n).fill(1)
  let count = 0
  for (const node of [...order].reverse()) {
    const childSizes = new Set()
    for (const child of adj[node]) {
      if (child !== parent[node]) { size[node] += size[child]; childSizes.add(size[child]) }
    }
    if (childSizes.size <= 1) count += 1
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const MAX_NODES = 12
const readJson = text => {
  if (typeof text !== "string") return text
  try { return JSON.parse(text) } catch (error) {
    throw new Error(`Input must be JSON such as {"edges": [[0,1],[0,2]]}: ${error.message}`)
  }
}

export function parseInput(text) {
  const data = readJson(text)
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be an object with key "edges".')
  const { edges } = data
  if (!Array.isArray(edges)) throw new Error('Key "edges" must be an array of [u, v] pairs.')
  const n = edges.length + 1
  if (n > MAX_NODES) throw new Error(`The visualization accepts at most ${MAX_NODES} nodes.`)
  const adj = Array.from({ length: n }, () => [])
  edges.forEach((edge, index) => {
    if (!Array.isArray(edge) || edge.length !== 2) throw new Error(`Edge ${index} must be a pair [u, v].`)
    const [u, v] = edge
    if (![u, v].every(value => Number.isInteger(value) && value >= 0 && value < n)) throw new Error(`Edge ${index} must use node labels from 0 to ${n - 1}.`)
    if (u === v) throw new Error("Self loops are not allowed in a tree.")
    adj[u].push(v)
    adj[v].push(u)
  })
  const seen = new Set([0])
  const stack = [0]
  while (stack.length) {
    const node = stack.pop()
    adj[node].forEach(next => { if (!seen.has(next)) { seen.add(next); stack.push(next) } })
  }
  if (seen.size !== n) throw new Error("The edges must connect all nodes into one tree.")
  return { edges }
}

export function buildTrace(input) {
  const { edges } = input
  const n = edges.length + 1
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u) })
  const frames = []
  const parent = Array(n).fill(-1)
  const order = []
  const visited = Array(n).fill(false)
  const size = Array(n).fill(1)
  const good = Array(n).fill(false)
  let count = 0
  const add = (phase, activeLine, pythonText, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: at(pythonText), message, n, edges, parent: [...parent],
    size: [...size], good: [...good], count, ...extra,
  })
  add("build", L("const adj = Array"), "adj = [[]", "Build the adjacency list from the edges.", { node: -1 })
  visited[0] = true
  const stack = [0]
  while (stack.length) {
    const node = stack.pop()
    order.push(node)
    adj[node].forEach(next => { if (!visited[next]) { visited[next] = true; parent[next] = node; stack.push(next) } })
  }
  add("root", L("const size = Array"), "stack = [0]", `Root the tree at 0. Visit order: ${order.join(", ")}.`, { node: 0 })
  for (const node of [...order].reverse()) {
    const childSizes = new Set()
    adj[node].forEach(child => {
      if (child !== parent[node]) {
        size[node] += size[child]
        childSizes.add(size[child])
      }
    })
    add("size", L("size[node] += size[child]"), "size[node] += size[child]", `Node ${node} has subtree size ${size[node]}.`, { node, childSizes: [...childSizes] })
    if (childSizes.size <= 1) {
      count += 1
      good[node] = true
      add("good", L("if (childSizes.size <= 1)"), "good += 1", `Node ${node} is good: its child subtree sizes are ${childSizes.size ? [...childSizes].join(", ") : "none"}.`, { node, childSizes: [...childSizes] })
    } else {
      add("check", L("if (childSizes.size <= 1)"), "if len(child_sizes) <= 1", `Node ${node} is not good: its child subtree sizes differ.`, { node, childSizes: [...childSizes] })
    }
  }
  add("done", L("return count"), "return good", `Return ${count} good nodes.`, { node: -1 })
  return { input: { edges }, result: count, frames }
}
