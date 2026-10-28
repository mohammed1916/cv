export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.parent) || !Array.isArray(obj.nums)) throw new Error('Use an object with parent and nums arrays.')
  const { parent, nums } = obj
  const n = parent.length
  if (n < 1 || n > 12) throw new Error('Use 1 to 12 nodes for the visualization.')
  if (nums.length !== n) throw new Error('nums must have the same length as parent.')
  if (parent[0] !== -1) throw new Error('parent[0] must be -1 for the root.')
  for (let i = 1; i < n; i++) {
    if (!Number.isInteger(parent[i]) || parent[i] < 0 || parent[i] > n - 1) throw new Error(`parent[${i}] must be a node from 0 to ${n - 1}.`)
  }
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000)) throw new Error('Each value must be an integer from 1 to 1000000.')
  // Every node must reach the root without a cycle.
  for (let i = 0; i < n; i++) {
    let v = i
    let steps = 0
    while (v !== 0) {
      v = parent[v]
      steps++
      if (steps > n) throw new Error('parent does not describe a tree rooted at 0.')
    }
  }
  return { parent, nums }
}

export function buildTrace(input) {
  const { parent, nums } = input
  const n = parent.length
  const depth = Array(n).fill(0)
  depth[0] = 1
  const frames = []
  for (let i = 0; i < n; i++) {
    const chain = []
    let v = i
    while (depth[v] === 0) {
      chain.push(v)
      v = parent[v]
    }
    let d = depth[v]
    for (const node of chain.reverse()) {
      d += 1
      depth[node] = d
    }
    frames.push({ phase: 'depth', activeLine: L('find the depth of node'), index: i, depth: depth.slice(), height: null, total: 0, message: `Node ${i} has depth ${depth[i]}.` })
  }
  const height = Math.max(...depth)
  let total = 0
  for (let i = 0; i < n; i++) {
    const weight = nums[i] * (height - depth[i] + 1)
    total += weight
    frames.push({ phase: 'weight', activeLine: L('add nums[i] times'), index: i, depth: depth.slice(), height, total, message: `Node ${i} contributes ${nums[i]} × ${height - depth[i] + 1} = ${weight}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, depth: depth.slice(), height, total, message: `Weighted sum: ${total}.` })
  return { input, result: total, frames }
}

export const code = `weighted sum of a tree(parent, nums)
  set the depth of the root to 1
  for each node i do
    find the depth of node i by walking up to a node with a known depth
  set height to the largest depth
  set total to 0
  for each node i do
    add nums[i] times (height minus depth[i] plus 1) to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def weighted_tree_sum(parent, nums):
    n = len(parent)
    depth = [0] * n
    depth[0] = 1
    for i in range(n):
        chain = []
        v = i
        while depth[v] == 0:
            chain.append(v)
            v = parent[v]
        d = depth[v]
        for node in reversed(chain):
            d += 1
            depth[node] = d
    height = max(depth)
    total = 0
    for i in range(n):
        total += nums[i] * (height - depth[i] + 1)
    return total
`
