// Pure model for graph and grid traversal views (BFS, DFS, topological sort, bipartite colouring).
// No React: every function is node-testable.

/** Positions n nodes on a circle inside a width x height box. */
export function graphCircleLayout(n, width = 420, height = 300) {
  const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2 - 30
  return Array.from({ length: n }, (_, i) => {
    if (n === 1) return { x: cx, y: cy }
    const angle = 2 * Math.PI * i / n - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })
}

/** Role of one node in the current step. Priority: current > neighbour > frontier > done > visited. */
export function graphNodeRole(id, { current, neighbour, frontier = [], visited = [], done = [] }) {
  if (id === current) return 'current'
  if (id === neighbour) return 'neighbour'
  if (frontier.includes(id)) return 'frontier'
  if (done.includes(id)) return 'done'
  if (visited.includes(id)) return 'visited'
  return ''
}

/** True when the edge u-v is the one being examined (either direction for undirected graphs). */
export function isActiveEdge(u, v, { current, neighbour, directed = false, reversed = false }) {
  if (current === undefined || current === null || neighbour === undefined || neighbour === null) return false
  const [a, b] = reversed ? [neighbour, current] : [current, neighbour]
  return directed ? (u === a && v === b) : ((u === a && v === b) || (u === b && v === a))
}

/** Turns a deduplicated edge list from an adjacency list ([[1,2],[0],[0]] -> [[0,1],[0,2]]). */
export function edgesFromAdjacency(adjacency, directed = false) {
  const seen = new Set(), edges = []
  adjacency.forEach((row, u) => row.forEach(v => {
    const key = directed ? `${u}>${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`
    if (!seen.has(key)) { seen.add(key); edges.push([u, v]) }
  }))
  return edges
}

/** Plain-words description of what the frontier holds. */
export function describeFrontier(kind, items, name = String) {
  const word = kind === 'stack' ? 'Stack (top is last)' : 'Queue (front first)'
  return items.length ? `${word}: ${items.map(name).join(', ')}` : `${word}: empty`
}

/**
 * Operations that turn the previous frontier into the next one, in words.
 * Queue: removals happen at the front, additions at the back. Stack: both at the top.
 */
export function frontierOps(prev, next, kind = 'queue', name = String) {
  prev = prev ?? []
  let common = 0
  if (kind === 'queue') {
    // Longest overlap where the front of prev was dropped and next starts as a suffix of prev.
    let best = 0
    for (let drop = 0; drop <= prev.length; drop++) {
      const rest = prev.slice(drop)
      if (rest.every((x, i) => next[i] === x)) { best = drop; common = rest.length; break }
    }
    const lines = []
    prev.slice(0, best).forEach(x => lines.push(`Dequeue ${name(x)} from the front of the queue.`))
    next.slice(common).forEach(x => lines.push(`Enqueue ${name(x)} at the back of the queue.`))
    return lines
  }
  while (common < prev.length && common < next.length && prev[common] === next[common]) common++
  const lines = []
  prev.slice(common).reverse().forEach(x => lines.push(`Pop ${name(x)} off the stack.`))
  next.slice(common).forEach(x => lines.push(`Push ${name(x)} onto the stack.`))
  return lines
}

/** 'A' / 'B' for a two-colouring; '?' while uncoloured (-1 / null / undefined). */
export function colourName(c) {
  return c === 0 ? 'A' : c === 1 ? 'B' : '?'
}

/** Per-node tag text for in-degree / out-degree / colour displays. */
export function degreeTags(degrees, prefix = 'in') {
  return Object.fromEntries(degrees.map((d, i) => [i, `${prefix} ${d}`]))
}
export function colourTags(colours) {
  return Object.fromEntries(colours.map((c, i) => [i, `colour ${colourName(c)}`]))
}

/** Role of a grid cell. Cells are [row, col] pairs. */
export function gridCellRole(r, c, { current, neighbour, frontier = [], visited = [], done = [] }) {
  const is = cell => cell && cell[0] === r && cell[1] === c
  if (is(current)) return 'current'
  if (is(neighbour)) return 'neighbour'
  if (frontier.some(is)) return 'frontier'
  if (done.some(is)) return 'done'
  if (visited.some(is)) return 'visited'
  return ''
}

/** Compact readable names for a cell. */
export const cellName = cell => `(${cell[0]},${cell[1]})`
