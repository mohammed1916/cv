const PY = [
  "def timeTaken(edges):",
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
  "    def weight(node):",
  "        return 1 if node % 2 == 1 else 2",
  "    down = [0] * n",
  "    for node in reversed(order):",
  "        for child in adj[node]:",
  "            if child != parent[node]:",
  "                down[node] = max(down[node], weight(child) + down[child])",
  "    NEG = float(\"-inf\")",
  "    up = [NEG] * n",
  "    for node in order:",
  "        best = NEG",
  "        second = NEG",
  "        best_child = -1",
  "        for child in adj[node]:",
  "            if child == parent[node]:",
  "                continue",
  "            value = weight(child) + down[child]",
  "            if value > best:",
  "                second = best",
  "                best = value",
  "                best_child = child",
  "            elif value > second:",
  "                second = value",
  "        for child in adj[node]:",
  "            if child == parent[node]:",
  "                continue",
  "            sibling = second if child == best_child else best",
  "            outside = max(0, up[node], sibling)",
  "            up[child] = weight(node) + outside",
  "    return [max(down[node], up[node]) for node in range(n)]",
]

export const python = PY.join("\n")
const at = text => PY.findIndex(line => line.includes(text)) + 1

export const code = [
  { line: 1, text: "build the adjacency list from edges" },
  { line: 2, text: "root the tree at node 0 and record each parent" },
  { line: 3, text: "for each node from the bottom up, take the best time reached through its children" },
  { line: 4, text: "for each node from the top down, take the best time reached through its parent" },
  { line: 5, text: "answer for a node is the larger of its downward and upward times" },
  { line: 6, text: "return the answers" },
]

const MAX_NODES = 12
const NEG = -Infinity
const weightOf = node => (node % 2 === 1 ? 1 : 2)

function readJson(text) {
  if (typeof text !== "string") return text
  try {
    return JSON.parse(text)
  } catch (error) {
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
  const frames = []
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u) })
  const parent = Array(n).fill(-1)
  const order = []
  const visited = Array(n).fill(false)
  const down = Array(n).fill(0)
  const up = Array(n).fill(NEG)
  const answer = Array(n).fill(0)
  const add = (phase, activeLine, pythonText, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: at(pythonText), message, n, edges, parent: [...parent], down: [...down],
    up: up.map(value => (value === NEG ? null : value)), answer: [...answer], ...extra,
  })
  add("build", 1, "adj = [[]", "Build the adjacency list from the edges.", { node: -1 })
  visited[0] = true
  const stack = [0]
  while (stack.length) {
    const node = stack.pop()
    order.push(node)
    adj[node].forEach(next => {
      if (!visited[next]) { visited[next] = true; parent[next] = node; stack.push(next) }
    })
  }
  add("root", 2, "visited[0] = True", `Root the tree at node 0. Visit order: ${order.join(", ")}.`, { node: 0, order: [...order] })
  for (const node of [...order].reverse()) {
    adj[node].forEach(child => {
      if (child !== parent[node]) down[node] = Math.max(down[node], weightOf(child) + down[child])
    })
    add("down", 3, "down[node] = max(", `Node ${node}: downward time ${down[node]} through its children.`, { node, order: [...order] })
  }
  for (const node of order) {
    let best = NEG
    let second = NEG
    let bestChild = -1
    adj[node].forEach(child => {
      if (child === parent[node]) return
      const value = weightOf(child) + down[child]
      if (value > best) { second = best; best = value; bestChild = child } else if (value > second) second = value
    })
    adj[node].forEach(child => {
      if (child === parent[node]) return
      const sibling = child === bestChild ? second : best
      const outside = Math.max(0, up[node], sibling)
      up[child] = weightOf(node) + outside
      add("up", 4, "up[child] = weight(node)", `Node ${child}: time through parent ${node} is ${up[child]}.`, { node: child, order: [...order] })
    })
  }
  for (let node = 0; node < n; node += 1) {
    answer[node] = Math.max(down[node], up[node])
    add("answer", 5, "return [max(", `Start at ${node}: the last node is marked at time ${answer[node]}.`, { node, order: [...order] })
  }
  add("done", 6, "return [max(", `Return [${answer.join(", ")}].`, { node: -1, order: [...order] })
  return { input: { edges }, result: answer, frames }
}
