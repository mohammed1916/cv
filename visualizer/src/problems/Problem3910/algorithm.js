export function parseInput(text) {
  const data = JSON.parse(text), nums = data?.nums, edges = data?.edges
  if (!Array.isArray(nums) || !nums.length || nums.length > 13 || nums.some(v => v !== 0 && v !== 1) || !Array.isArray(edges)
    || edges.length > nums.length * (nums.length - 1) / 2) throw new Error('Enter {"nums":[0,1],"edges":[[0,1]]}: 1–13 binary node values and distinct undirected edges.')
  const seen = new Set()
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(Number.isInteger) || edge[0] < 0 || edge[0] >= edge[1] || edge[1] >= nums.length || seen.has(edge.join(','))) {
      throw new Error('Each edge must be a unique [u,v] with 0 ≤ u < v < nums.length.')
    }
    seen.add(edge.join(','))
  }
  return { nums, edges }
}

export function buildTrace({ nums, edges }) {
  const adjacency = Array.from({ length: nums.length }, () => [])
  for (const [u, v] of edges) { adjacency[u].push(v); adjacency[v].push(u) }
  let total = 0
  const frames = [{ phase: 'start', mask: 0, sum: 0, reached: 0, node: -1, total, activeLine: 2, message: 'Enumerate non-empty node subsets. Keep only edges whose endpoints are both selected.' }]
  const decisions = []
  for (let mask = 1; mask < 2 ** nums.length; mask++) {
    let sum = 0
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) sum += nums[i]
    frames.push({ phase: 'select', mask, sum, reached: 0, node: -1, total, activeLine: 9, message: `Subset mask ${mask}: node-value sum ${sum} is ${sum % 2 ? 'odd' : 'even'}.` })
    let reached = 0, connected = null
    if (sum % 2 === 0) {
      const seed = 31 - Math.clz32(mask & -mask), queue = [seed]
      reached = 1 << seed
      for (let head = 0; head < queue.length; head++) {
        const node = queue[head]
        for (const next of adjacency[node]) {
          if ((mask & (1 << next)) && !(reached & (1 << next))) { reached |= 1 << next; queue.push(next) }
        }
        frames.push({ phase: 'visit', mask, sum, reached, node, queued: queue.length - head - 1, total, activeLine: 13,
          message: `Visit node ${node} using only selected endpoints. ${queue.length - head - 1} discovered nodes remain in the queue.` })
      }
      connected = reached === mask
      if (connected) total++
    }
    const counted = connected === true
    decisions.push({ mask, sum, connected, counted })
    frames.push({ phase: 'decide', mask, sum, reached, node: -1, connected, counted, total, activeLine: sum % 2 ? 10 : counted ? 19 : 18,
      message: sum % 2 ? 'Reject: odd sum. Connectivity need not be tested.' : counted ? `Count this subset: even sum and connected. Running total ${total}.` : 'Reject: even sum, but some selected nodes are unreachable without excluded nodes.' })
  }
  frames.push({ phase: 'done', mask: 0, sum: 0, reached: 0, node: -1, total, activeLine: 20, message: `Checked all ${decisions.length} non-empty subsets. Count = ${total}.` })
  return { input: [...nums], edges: edges.map(edge => [...edge]), result: total, decisions, frames }
}

export const code = `def countSubgraphs(nums, edges):
    adj = [[] for _ in nums]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    answer = 0
    for mask in range(1, 1 << len(nums)):
        selected = {i for i in range(len(nums)) if mask & (1 << i)}
        if sum(nums[i] for i in selected) % 2:
            continue
        seed = min(selected)
        seen, queue = {seed}, [seed]
        for node in queue:
            for other in adj[node]:
                if other in selected and other not in seen:
                    seen.add(other)
                    queue.append(other)
        if seen == selected:
            answer += 1
    return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
