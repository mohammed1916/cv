export function parseInput(text) {
  const input = JSON.parse(text)
  const { edges, first, second } = input ?? {}
  if (!Array.isArray(edges) || edges.length < 2 || edges.length > 12) throw new Error('Use 2 to 12 edges.')
  if (edges.some(v => v !== -1 && (!Number.isInteger(v) || v < 0 || v >= edges.length))) {
    throw new Error('Each edge is -1 (no outgoing edge) or a node index inside the array.')
  }
  for (const start of [first, second]) {
    if (!Number.isInteger(start) || start < 0 || start >= edges.length) throw new Error('first and second must be node indexes inside the array.')
  }
  return { edges, first, second }
}

export function buildTrace({ edges, first, second }) {
  const n = edges.length
  const frames = [{ phase: 'start', activeLine: L('closest node reached from both starts'), node: null, fromFirst: Array(n).fill(-1), fromSecond: Array(n).fill(-1), best: -1, message: 'Each node has at most one outgoing edge, so walking from a start gives one distance per node.' }]

  const fromFirst = Array(n).fill(-1)
  const fromSecond = Array(n).fill(-1)
  const walk = (start, label, dist) => {
    let cur = start
    let steps = 0
    while (cur !== -1 && dist[cur] === -1) {
      dist[cur] = steps
      frames.push({ phase: 'walk', activeLine: L(label), node: cur, fromFirst: [...fromFirst], fromSecond: [...fromSecond], best: -1, message: `From ${start}, node ${cur} is ${steps} step${steps === 1 ? '' : 's'} away.` })
      cur = edges[cur]
      steps++
    }
  }
  walk(first, 'walk from the first start', fromFirst)
  walk(second, 'walk from the second start', fromSecond)

  let best = -1
  let bestWorst = null
  for (let node = 0; node < n; node++) {
    if (fromFirst[node] < 0 || fromSecond[node] < 0) continue
    const worst = Math.max(fromFirst[node], fromSecond[node])
    if (bestWorst === null || worst < bestWorst) {
      best = node
      bestWorst = worst
      frames.push({ phase: 'compare', activeLine: L('best becomes this node'), node, fromFirst, fromSecond, best, message: `Node ${node} is reached by both, with a farther distance of ${worst}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), node: null, fromFirst, fromSecond, best, message: best === -1 ? 'No node is reached from both starts.' : `Closest shared node: ${best}.` })
  return { input: { edges, first, second }, result: best, frames }
}

export const code = `closest node reached from both starts
  walk from the first start, recording the steps to each node it reaches
  walk from the second start, recording the steps to each node it reaches
  best is none
  for each node in index order that both walks reached
    if best is none or its larger step count is below the best's larger step count then
      best becomes this node
  return best, or -1 when no node is reached by both`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def closest_meeting_point(edges, first, second):
    def walk(start):
        dist = [-1] * len(edges)
        cur = start
        steps = 0
        while cur != -1 and dist[cur] == -1:
            dist[cur] = steps
            cur = edges[cur]
            steps += 1
        return dist

    from_first = walk(first)
    from_second = walk(second)
    best = -1
    best_worst = None
    for node in range(len(edges)):
        if from_first[node] < 0 or from_second[node] < 0:
            continue
        worst = max(from_first[node], from_second[node])
        if best_worst is None or worst < best_worst:
            best = node
            best_worst = worst
    return best
`
