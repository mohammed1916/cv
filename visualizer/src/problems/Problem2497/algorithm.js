export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Use an object with keys vals, edges and k.')
  const { vals, edges, k } = obj
  if (!Array.isArray(vals) || vals.length < 1 || vals.length > 10) throw new Error('vals is an array of 1 to 10 integers.')
  if (vals.some(v => !Number.isInteger(v) || v < -100 || v > 100)) throw new Error('Values are integers from -100 to 100.')
  if (!Array.isArray(edges) || edges.length > 20) throw new Error('edges is a list of at most 20 pairs.')
  const seen = new Set()
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2) throw new Error('Each edge is a pair of node numbers.')
    const [u, v] = e
    if (!Number.isInteger(u) || !Number.isInteger(v) || u < 0 || v < 0 || u >= vals.length || v >= vals.length || u === v) throw new Error('Edge endpoints must be different valid nodes.')
    const key = `${Math.min(u, v)},${Math.max(u, v)}`
    if (seen.has(key)) throw new Error('Edges must be unique.')
    seen.add(key)
  }
  if (!Number.isInteger(k) || k < 0 || k > 10) throw new Error('k is an integer from 0 to 10.')
  return { vals, edges, k }
}

export function buildTrace(input) {
  const { vals, edges, k } = input
  const adj = vals.map(() => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  let best = null
  const frames = [{ phase: 'start', activeLine: L('build the list of neighbours'), index: -1, marked: [], best, message: 'Every node can be the center of a star.' }]
  vals.forEach((value, c) => {
    const ranked = adj[c].slice().sort((x, y) => vals[y] - vals[x])
    let total = value
    let taken = 0
    const picked = []
    for (const nb of ranked) {
      if (taken >= k || vals[nb] <= 0) break
      total += vals[nb]
      taken += 1
      picked.push(nb)
    }
    if (best === null || total > best) best = total
    frames.push({ phase: 'center', activeLine: L('for each center'), index: c, marked: picked, best, message: `Center ${c} (value ${value}) with ${picked.length} neighbour(s) gives ${total}. Best so far: ${best}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, marked: [], best, message: `Maximum star sum: ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum star sum of a graph
  build the list of neighbours of every node
  set best to nothing
  for each center node c
    set total to the value of c
    set taken to 0
    sort the neighbours of c by value, largest first
    for each neighbour in that order
      if fewer than k neighbours are taken and the value is above 0 then
        add the neighbour value to total
        add 1 to taken
    if best is unset or total is above best then
      set best to total
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_star_sum(vals, edges, k):
    adj = [[] for _ in vals]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    best = None
    for c, value in enumerate(vals):
        total = value
        taken = 0
        for nb in sorted(adj[c], key=lambda x: vals[x], reverse=True):
            if taken >= k or vals[nb] <= 0:
                break
            total += vals[nb]
            taken += 1
        if best is None or total > best:
            best = total
    return best
`
