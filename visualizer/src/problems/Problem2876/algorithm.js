export function parseInput(text) {
  const input = JSON.parse(text)
  const edges = input?.edges
  if (!Array.isArray(edges) || edges.length < 2 || edges.length > 12) throw new Error('Use 2 to 12 edges.')
  if (edges.some((v, i) => !Number.isInteger(v) || v < 0 || v >= edges.length || v === i)) {
    throw new Error('Each edge points to a different node inside the array.')
  }
  return { edges }
}

export function buildTrace({ edges }) {
  const n = edges.length
  const ans = Array(n).fill(0)
  const state = Array(n).fill(0) // 0 unseen, 1 on the current walk, 2 answered
  const pos = Array(n).fill(0)
  const frames = [{ phase: 'start', activeLine: L('count visited nodes for every start'), node: null, path: [], ans: [...ans], message: 'Walk from each unanswered node, stopping when the walk meets a node already on it or already answered.' }]

  for (let start = 0; start < n; start++) {
    if (state[start] !== 0) continue
    const path = []
    let cur = start
    while (state[cur] === 0) {
      state[cur] = 1
      pos[cur] = path.length
      path.push(cur)
      frames.push({ phase: 'walk', activeLine: L('walk from start along the edges'), node: cur, path: [...path], ans: [...ans], message: `Walk to node ${cur}.` })
      cur = edges[cur]
    }
    let end
    if (state[cur] === 1) {
      const cycleStart = pos[cur]
      const cycleLength = path.length - cycleStart
      for (let k = cycleStart; k < path.length; k++) {
        ans[path[k]] = cycleLength
        state[path[k]] = 2
      }
      frames.push({ phase: 'cycle', activeLine: L('the walk returned to a node on this walk'), node: cur, path: [...path], ans: [...ans], message: `The walk loops back to node ${cur}: a cycle of ${cycleLength} nodes, each with answer ${cycleLength}.` })
      end = cycleStart
    } else {
      end = path.length
    }
    for (let k = end - 1; k >= 0; k--) {
      ans[path[k]] = ans[edges[path[k]]] + 1
      state[path[k]] = 2
      frames.push({ phase: 'unwind', activeLine: L('the node before it gets one more'), node: path[k], path: [...path], ans: [...ans], message: `Node ${path[k]} reaches an answered node, so it gets ${ans[path[k]]}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the answers'), node: null, path: [], ans: [...ans], message: `Visited counts: ${ans.join(', ')}.` })
  return { input: { edges }, result: ans, frames }
}

export const code = `count visited nodes for every start
  set every node as unseen
  for each node start that is unseen
    walk from start along the edges, marking nodes as on this walk, until a node is unseen or on this walk
    if the walk returned to a node on this walk then
      every node on the cycle gets the cycle length
    for each node on the walk before the cycle, from last to first
      the node before it gets one more than the node it points to
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_visited(edges):
    n = len(edges)
    ans = [0] * n
    state = [0] * n
    pos = [0] * n
    for start in range(n):
        if state[start] != 0:
            continue
        path = []
        cur = start
        while state[cur] == 0:
            state[cur] = 1
            pos[cur] = len(path)
            path.append(cur)
            cur = edges[cur]
        if state[cur] == 1:
            cycle_start = pos[cur]
            cycle_length = len(path) - cycle_start
            for k in range(cycle_start, len(path)):
                ans[path[k]] = cycle_length
                state[path[k]] = 2
            end = cycle_start
        else:
            end = len(path)
        for k in range(end - 1, -1, -1):
            ans[path[k]] = ans[edges[path[k]]] + 1
            state[path[k]] = 2
    return ans
`
