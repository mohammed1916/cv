const PSEUDO = [
  'find the longest special path with at most one repeated value',
  'build parent, depth and distance from root 0',
  'best length is zero and best nodes is one',
  'for each node as the lower end',
  'count values and repeats is zero',
  'walk up from the lower end',
  'add the value at this ancestor to the counts',
  'if a second value repeat appears then stop',
  'length is distance down and nodes is the count',
  'keep the longer path, or the shorter one on a tie',
  'return best length and best nodes',
]
export const code = PSEUDO.map((text, index) => ({ line: index + 1, text }))
const PS = key => code.find(entry => entry.text.includes(key))?.line ?? 1

export const python = `def longest_special_path(edges, nums):
    n = len(nums)
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((v, w))
        graph[v].append((u, w))
    parent = [-1] * n
    depth = [0] * n
    dist = [0] * n
    seen = [False] * n
    seen[0] = True
    order = [0]
    for node in order:
        for nxt, w in graph[node]:
            if not seen[nxt]:
                seen[nxt] = True
                parent[nxt] = node
                depth[nxt] = depth[node] + 1
                dist[nxt] = dist[node] + w
                order.append(nxt)
    best_len, best_nodes = 0, 1
    for node in range(n):
        count = {}
        repeats = 0
        cur = node
        while cur != -1:
            value = nums[cur]
            count[value] = count.get(value, 0) + 1
            if count[value] == 2:
                if repeats == 1:
                    break
                repeats = 1
            elif count[value] >= 3:
                break
            length = dist[node] - dist[cur]
            nodes = depth[node] - depth[cur] + 1
            if length > best_len or (length == best_len and nodes < best_nodes):
                best_len, best_nodes = length, nodes
            cur = parent[cur]
    return [best_len, best_nodes]
`
const PYTHON_LINES = python.split('\n')
const PY = key => PYTHON_LINES.findIndex(text => text.includes(key)) + 1

const frame = fields => ({ ...fields, activeLine: PS(fields.pseudo), pythonLine: PY(fields.py) })

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with edges and nums.')
  const { edges, nums } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 10 || !nums.every(v => Number.isInteger(v) && v >= 0 && v <= 4)) {
    throw new Error('nums has 2 to 10 integers from 0 to 4.')
  }
  const n = nums.length
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges has exactly n - 1 entries.')
  const graph = Array.from({ length: n }, () => [])
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 3) throw new Error('Each edge is [u, v, length].')
    const [u, v, w] = edge
    if (![u, v].every(x => Number.isInteger(x) && x >= 0 && x < n) || u === v) throw new Error('Edge endpoints are distinct nodes from 0 to n - 1.')
    if (!Number.isInteger(w) || w < 1 || w > 9) throw new Error('Edge lengths are integers from 1 to 9.')
    graph[u].push(v)
    graph[v].push(u)
  }
  const seen = new Set([0])
  const queue = [0]
  for (const node of queue) {
    for (const next of graph[node]) if (!seen.has(next)) { seen.add(next); queue.push(next) }
  }
  if (seen.size !== n) throw new Error('The edges must connect every node into one tree.')
  return { edges, nums }
}

export function buildTrace({ edges, nums }) {
  const n = nums.length
  const graph = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) {
    graph[u].push([v, w])
    graph[v].push([u, w])
  }
  const parent = Array(n).fill(-1)
  const depth = Array(n).fill(0)
  const dist = Array(n).fill(0)
  const seen = Array(n).fill(false)
  seen[0] = true
  const order = [0]
  for (const node of order) {
    for (const [next, w] of graph[node]) {
      if (seen[next]) continue
      seen[next] = true
      parent[next] = node
      depth[next] = depth[node] + 1
      dist[next] = dist[node] + w
      order.push(next)
    }
  }
  const frames = []
  let bestLen = 0
  let bestNodes = 1
  frames.push(frame({ phase: 'start', pseudo: 'best length is zero', py: 'best_len, best_nodes = 0, 1', at: -1, path: [], repeat: false, length: 0, bestLen, bestNodes,
    message: 'Root the tree at node 0 and start with the single-node path.' }))
  for (let node = 0; node < n; node++) {
    frames.push(frame({ phase: 'node', pseudo: 'for each node as the lower end', py: 'for node in range', at: node, path: [], repeat: false, length: 0, bestLen, bestNodes,
      message: `Node ${node} (value ${nums[node]}) is the lower end of a downward path.` }))
    const counts = new Map()
    let repeats = 0
    let cur = node
    const path = []
    while (cur !== -1) {
      const value = nums[cur]
      counts.set(value, (counts.get(value) || 0) + 1)
      const seenCount = counts.get(value)
      if (seenCount >= 2 && (seenCount >= 3 || repeats === 1)) {
        frames.push(frame({ phase: 'stop', pseudo: 'if a second value repeat appears', py: 'break', at: cur, path: [...path], repeat: true, length: dist[node] - dist[cur], bestLen, bestNodes,
          message: `Value ${value} would break the rule at node ${cur}; stop walking up.` }))
        break
      }
      if (seenCount === 2) repeats = 1
      path.push(cur)
      const length = dist[node] - dist[cur]
      const nodes = depth[node] - depth[cur] + 1
      frames.push(frame({ phase: 'walk', pseudo: 'add the value at this ancestor', py: 'count[value]', at: cur, path: [...path], repeat: repeats === 1, length, bestLen, bestNodes,
        message: `Path from node ${cur} down to ${node}: length ${length}, ${nodes} node${nodes === 1 ? '' : 's'}${repeats ? ', one repeat allowed' : ''}.` }))
      if (length > bestLen || (length === bestLen && nodes < bestNodes)) {
        bestLen = length
        bestNodes = nodes
        frames.push(frame({ phase: 'keep', pseudo: 'keep the longer path', py: 'best_len, best_nodes = length', at: cur, path: [...path], repeat: repeats === 1, length, bestLen, bestNodes,
          message: `New best: length ${bestLen} with ${bestNodes} node${bestNodes === 1 ? '' : 's'}.` }))
      }
      cur = parent[cur]
    }
  }
  frames.push(frame({ phase: 'done', pseudo: 'return best length and best nodes', py: 'return [best_len, best_nodes]', at: -1, path: [], repeat: false, length: bestLen, bestLen, bestNodes,
    message: `Result: [${bestLen}, ${bestNodes}].` }))
  return { input: { edges, nums }, result: [bestLen, bestNodes], frames }
}
