export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and edges.')
  const { nums, edges } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 8) throw new Error('nums must have 2 to 8 values.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 4)) throw new Error('Each value is an integer from 0 to 4.')
  const n = nums.length
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('A tree on n nodes needs n - 1 edges.')
  const parentOf = Array.from({ length: n }, (_, i) => i)
  const find = x => (parentOf[x] === x ? x : (parentOf[x] = find(parentOf[x])))
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3) throw new Error('Each edge is [u, v, weight].')
    const [u, v, w] = e
    if (![u, v].every(x => Number.isInteger(x) && x >= 0 && x < n) || !Number.isInteger(w) || w < 1 || w > 5) throw new Error('Edges use nodes 0 to n-1 and weights 1 to 5.')
    if (find(u) === find(v)) throw new Error('The edges must form a tree without cycles.')
    parentOf[find(u)] = find(v)
  }
  return { nums, edges }
}

export function buildTrace({ nums, edges }) {
  const n = nums.length
  const adjacency = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) { adjacency[u].push([v, w]); adjacency[v].push([u, w]) }
  const frames = []
  let bestLength = 0
  let bestNodes = 1
  frames.push({ phase: 'start', activeLine: L('set best length to 0'), node: -1, length: 0, nodes: 0, best: [bestLength, bestNodes], message: 'Start with the single-node path, length 0 and 1 node.' })
  for (let start = 0; start < n; start++) {
    frames.push({ phase: 'start', activeLine: L('for each start node'), node: start, length: 0, nodes: 1, best: [bestLength, bestNodes], message: `Walk outward from node ${start}.` })
    const walk = (v, parent, length, nodes, seen) => {
      if (length > bestLength || (length === bestLength && nodes < bestNodes)) {
        bestLength = length
        bestNodes = nodes
        frames.push({ phase: 'record', activeLine: L('otherwise record the path'), node: v, length, nodes, best: [bestLength, bestNodes], message: `Path to ${v} has length ${length} and ${nodes} nodes; it is the new best.` })
      } else {
        frames.push({ phase: 'visit', activeLine: L('otherwise record the path'), node: v, length, nodes, best: [bestLength, bestNodes], message: `Path to ${v} has length ${length}; not better than the best.` })
      }
      for (const [w, c] of adjacency[v]) {
        if (w === parent) continue
        if (seen.has(nums[w])) {
          frames.push({ phase: 'stop', activeLine: L('stop extending if'), node: w, length, nodes, best: [bestLength, bestNodes], message: `Node ${w} repeats value ${nums[w]} already on the path; stop there.` })
          continue
        }
        walk(w, v, length + c, nodes + 1, new Set([...seen, nums[w]]))
      }
    }
    walk(start, -1, 0, 1, new Set([nums[start]]))
  }
  frames.push({ phase: 'done', activeLine: L('return best length'), node: -1, length: bestLength, nodes: bestNodes, best: [bestLength, bestNodes], message: `Longest special path: length ${bestLength} with ${bestNodes} nodes.` })
  return { input: { nums, edges }, result: [bestLength, bestNodes], frames }
}

export const code = `longest special path with its fewest nodes
  set best length to 0 and best node count to 1
  for each start node u
    walk outward from u along simple paths, keeping the values already on the path
    at each node v, stop extending if the value of v is already on the path
    otherwise record the path from u to v if it beats the best, comparing length then fewer nodes
  return best length and best node count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_special_path(nums, edges):
    n = len(nums)
    adjacency = [[] for _ in range(n)]
    for u, v, w in edges:
        adjacency[u].append((v, w))
        adjacency[v].append((u, w))
    best = [0, 1]

    def walk(v, parent, length, nodes, seen):
        if length > best[0] or (length == best[0] and nodes < best[1]):
            best[0] = length
            best[1] = nodes
        for w, c in adjacency[v]:
            if w == parent or nums[w] in seen:
                continue
            walk(w, v, length + c, nodes + 1, seen | {nums[w]})

    for start in range(n):
        walk(start, -1, 0, 1, frozenset([nums[start]]))
    return [best[0], best[1]]
`
