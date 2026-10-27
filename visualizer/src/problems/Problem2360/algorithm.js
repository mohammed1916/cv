export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.edges)) throw new Error('Use an object with an edges array.')
  const { edges } = obj
  const n = edges.length
  if (n < 1 || n > 12) throw new Error('edges has 1 to 12 entries in this visualization.')
  if (edges.some(v => !Number.isInteger(v) || v < -1 || v >= n)) throw new Error('Each entry is -1 (no outgoing edge) or a node index from 0 to n minus 1.')
  return { edges }
}

export function buildTrace(input) {
  const edges = input.edges
  const n = edges.length
  const owner = new Array(n).fill(-1)
  const step = new Array(n).fill(-1)
  let best = -1
  const frames = [{ phase: 'start', activeLine: L('set best to minus one'), node: -1, start: -1, best, message: 'No cycle found yet.' }]
  for (let s = 0; s < n; s++) {
    if (owner[s] !== -1) continue
    let node = s
    let k = 0
    while (node !== -1 && owner[node] === -1) {
      owner[node] = s
      step[node] = k++
      frames.push({ phase: 'walk', activeLine: L('mark node with owner'), node, start: s, best, message: `Walk from ${s}: mark node ${node} as step ${step[node]}.` })
      node = edges[node]
    }
    if (node !== -1 && owner[node] === s) {
      const length = k - step[node]
      if (length > best) best = length
      frames.push({ phase: 'cycle', activeLine: L('the cycle length is'), node, start: s, best, message: `The walk from ${s} returns to node ${node}: a cycle of length ${length}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), node: -1, start: -1, best, message: `Longest cycle: ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest cycle in a graph where each node has at most one outgoing edge
  set best to minus one
  set owner and step of every node to nothing
  for each start node s that has no owner do
    set node to s and k to 0
    while node is not empty and node has no owner do
      mark node with owner s and step k, then increase k by one
      move node to edges[node]
    if node is not empty and the owner of node is s then
      the cycle length is k minus the step of node
      set best to the larger of best and the cycle length
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_cycle(edges):
    n = len(edges)
    owner = [-1] * n
    step = [-1] * n
    best = -1
    for s in range(n):
        if owner[s] != -1:
            continue
        node = s
        k = 0
        while node != -1 and owner[node] == -1:
            owner[node] = s
            step[node] = k
            k += 1
            node = edges[node]
        if node != -1 and owner[node] == s:
            best = max(best, k - step[node])
    return best
`
