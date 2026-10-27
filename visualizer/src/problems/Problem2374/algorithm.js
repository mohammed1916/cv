export function parseInput(text) {
  const input = JSON.parse(text)
  const edges = input?.edges
  if (!Array.isArray(edges) || edges.length < 2 || edges.length > 12) throw new Error('Use 2 to 12 edges.')
  if (edges.some(v => !Number.isInteger(v) || v < 0 || v >= edges.length)) throw new Error('Each edge must point to a node index inside the array.')
  return { edges }
}

export function buildTrace({ edges }) {
  const n = edges.length
  const score = Array(n).fill(0)
  const frames = [{ phase: 'start', activeLine: L('give every node an edge score of zero'), node: null, score: [...score], best: 0, message: 'Every node starts with an edge score of zero.' }]

  for (let i = 0; i < n; i++) {
    score[edges[i]] += i
    frames.push({ phase: 'add', activeLine: L('add i to the score of the node'), node: edges[i], score: [...score], best: 0, message: `Node ${i} points to ${edges[i]}, so ${edges[i]} gains ${i} (score ${score[edges[i]]}).` })
  }

  let best = 0
  frames.push({ phase: 'scan', activeLine: L('best is node zero'), node: 0, score: [...score], best, message: 'Start the scan with node 0 as the best.' })
  for (let node = 1; node < n; node++) {
    if (score[node] > score[best]) {
      best = node
      frames.push({ phase: 'scan', activeLine: L('best becomes this node'), node, score: [...score], best, message: `Node ${node} has a higher score (${score[node]}).` })
    } else {
      frames.push({ phase: 'scan', activeLine: L('if its score is higher'), node, score: [...score], best, message: `Node ${node} does not beat ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), node: null, score: [...score], best, message: `Highest edge score: node ${best} with ${score[best]}.` })
  return { input: { edges }, result: best, frames }
}

export const code = `node with highest edge score
  give every node an edge score of zero
  for each node i in order
    add i to the score of the node that i points to
  best is node zero
  for each node in order
    if its score is higher than the best node's score then
      best becomes this node
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def edge_score_winner(edges):
    score = [0] * len(edges)
    for i, target in enumerate(edges):
        score[target] += i
    best = 0
    for node in range(len(edges)):
        if score[node] > score[best]:
            best = node
    return best
`
