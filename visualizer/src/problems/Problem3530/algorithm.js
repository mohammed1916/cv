export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.n) || !Array.isArray(obj.edges) || !Array.isArray(obj.score)) throw new Error('Use an object with integer n, an edges array and a score array.')
  const { n, edges, score } = obj
  if (n < 1 || n > 8) throw new Error('Use 1 to 8 nodes for the visualization.')
  if (score.length !== n || score.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('score needs n integers from 1 to 100000.')
  const seen = new Set()
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(v => Number.isInteger(v) && v >= 0 && v < n) || e[0] === e[1]) throw new Error('Each edge is a pair of different node numbers from 0 to n - 1.')
    const key = e.join(',')
    if (seen.has(key)) throw new Error('Edges must not repeat.')
    seen.add(key)
  }
  // Kahn's algorithm: a DAG empties completely.
  const indeg = Array(n).fill(0)
  for (const [, v] of edges) indeg[v] += 1
  const queue = indeg.map((d, i) => (d === 0 ? i : -1)).filter(i => i >= 0)
  let done = 0
  while (queue.length) {
    const u = queue.pop()
    done += 1
    for (const [a, b] of edges) if (a === u && --indeg[b] === 0) queue.push(b)
  }
  if (done !== n) throw new Error('The graph must be acyclic.')
  return { n, edges, score }
}

export function buildTrace(input) {
  const { n, edges, score } = input
  const need = Array(n).fill(0)
  for (const [u, v] of edges) need[v] |= 1 << u
  const full = (1 << n) - 1
  const NEG = -Infinity
  const best = Array(full + 1).fill(NEG)
  best[0] = 0
  const popcount = m => m.toString(2).split('').filter(c => c === '1').length
  const frames = [{ phase: 'start', activeLine: L('set best[0]'), mask: 0, value: 0, node: -1, message: 'No nodes are placed yet. Each mask is a set of nodes already placed in the first positions.' }]
  for (let mask = 0; mask <= full; mask++) {
    if (best[mask] === NEG) continue
    const placed = popcount(mask)
    for (let v = 0; v < n; v++) {
      if (mask & (1 << v)) continue
      if ((need[v] & mask) !== need[v]) continue
      const next = mask | (1 << v)
      const candidate = best[mask] + score[v] * (placed + 1)
      if (candidate > best[next]) best[next] = candidate
      frames.push({ phase: 'extend', activeLine: L('set best[mask | bit'), mask, value: candidate, node: v, message: `Place node ${v} at position ${placed + 1}: adds ${score[v]} x ${placed + 1} = ${score[v] * (placed + 1)}. Best for this set: ${best[next]}.` })
    }
  }
  const result = best[full]
  frames.push({ phase: 'done', activeLine: L('return best[full]'), mask: full, value: result, node: -1, message: `Maximum profit: ${result}.` })
  return { input, result, frames }
}

export const code = `maximum profit from a valid topological order:
  set need[v] to the mask of the predecessors of each node v
  set best[0] to 0 and every other mask to minus infinity
  for each mask from 0 to full:
    if best[mask] is set then
      for each node v not in mask whose predecessors are all in mask:
        set best[mask | bit v] to the larger of itself and best[mask] plus score[v] times (count in mask + 1)
  return best[full]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_profit_topological(n, edges, score):
    need = [0] * n
    for u, v in edges:
        need[v] |= 1 << u
    full = (1 << n) - 1
    NEG = float('-inf')
    best = [NEG] * (full + 1)
    best[0] = 0
    for mask in range(full + 1):
        if best[mask] == NEG:
            continue
        placed = bin(mask).count('1')
        for v in range(n):
            if (mask >> v) & 1:
                continue
            if (need[v] & mask) != need[v]:
                continue
            nxt = mask | (1 << v)
            candidate = best[mask] + score[v] * (placed + 1)
            if candidate > best[nxt]:
                best[nxt] = candidate
    return best[full]
`
