const MAX_NODES = 8
const MAX_BASE = 9

function lookup(lines, text) {
  const index = lines.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with baseTime and edges.')
  const { baseTime, edges } = input
  if (!Array.isArray(baseTime) || baseTime.length < 1 || baseTime.length > MAX_NODES) throw new Error(`baseTime has 1 to ${MAX_NODES} entries.`)
  if (baseTime.some(v => !Number.isInteger(v) || v < 1 || v > MAX_BASE)) throw new Error(`Each baseTime is an integer from 1 to ${MAX_BASE}.`)
  const n = baseTime.length
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('A tree on n nodes needs exactly n minus 1 edges.')
  const adj = Array.from({ length: n }, () => [])
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || e.some(v => !Number.isInteger(v) || v < 0 || v >= n) || e[0] === e[1]) throw new Error('Each edge is a pair of different node indices.')
    adj[e[0]].push(e[1])
    adj[e[1]].push(e[0])
  }
  const seen = new Set([0])
  const queue = [0]
  while (queue.length) {
    const v = queue.shift()
    for (const c of adj[v]) if (!seen.has(c)) { seen.add(c); queue.push(c) }
  }
  if (seen.size !== n) throw new Error('The edges must connect every node.')
  return { baseTime, edges }
}

export function buildTrace({ baseTime, edges }) {
  const L = text => lookup(code, text)
  const P = text => lookup(pyLines, text)
  const n = baseTime.length
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) {
    adj[a].push(b)
    adj[b].push(a)
  }
  const frames = []
  let best = null
  let bestRoot = null
  let finished = Array(n).fill(null)
  frames.push({ pythonLine: P('adj = [[] for'), phase: 'start', activeLine: L('build the adjacency'), root: null, node: null, value: null, finished: finished.slice(), best, bestRoot, message: 'Build the adjacency lists. Each node could be the root.' })

  const compute = (v, parent, root) => {
    const childTimes = []
    for (const c of adj[v]) if (c !== parent) childTimes.push(compute(c, v, root))
    let value
    if (!childTimes.length) {
      value = baseTime[v]
      finished[v] = value
      frames.push({ pythonLine: P('return base[v]'), phase: 'node', activeLine: L('then return base[v]'), root, node: v, value, finished: finished.slice(), best, bestRoot, message: `Node ${v} is a leaf and finishes at its base time ${value}.` })
    } else {
      const earliest = Math.min(...childTimes)
      const latest = Math.max(...childTimes)
      value = 2 * latest - earliest + baseTime[v]
      finished[v] = value
      frames.push({ pythonLine: P('return 2 * latest'), phase: 'node', activeLine: L('return 2 * latest'), root, node: v, value, finished: finished.slice(), best, bestRoot, message: `Node ${v}: children finish between ${earliest} and ${latest}, so it finishes at ${value}.` })
    }
    return value
  }

  for (let r = 0; r < n; r++) {
    finished = Array(n).fill(null)
    frames.push({ pythonLine: P('for r in range'), phase: 'root', activeLine: L('for each root r'), root: r, node: null, value: null, finished: finished.slice(), best, bestRoot, message: `Make node ${r} the root and finish the tree from the leaves up.` })
    const f = compute(r, -1, r)
    if (best === null || f < best) {
      best = f
      bestRoot = r
      frames.push({ pythonLine: P('best = f'), phase: 'keep', activeLine: L('if best is unknown or f < best'), root: r, node: r, value: f, finished: finished.slice(), best, bestRoot, message: `Root ${r} finishes at ${f}, the smallest so far.` })
    } else {
      frames.push({ pythonLine: P('if best is None or f < best'), phase: 'skip', activeLine: L('if best is unknown or f < best'), root: r, node: r, value: f, finished: finished.slice(), best, bestRoot, message: `Root ${r} finishes at ${f}, which does not beat ${best}.` })
    }
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), root: bestRoot, node: null, value: best, finished: finished.slice(), best, bestRoot, message: `The smallest root finish time is ${best}, with root ${bestRoot}.` })
  return { input: { baseTime, edges }, result: best, frames }
}

export const code = `smallest root finish time
  build the adjacency lists from the edges
  set best to unknown
  for each root r from 0 to n minus 1
    f = finish(r, no parent)
    if best is unknown or f < best then best = f
  return best

function finish(v, parent)
  for each child c of v (neighbors other than parent)
    fc = finish(c, v)
  if v has no children then return base[v]
  earliest and latest = min and max of the child finish times
  return 2 * latest - earliest + base[v]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def smallest_root_finish(base, edges):
    n = len(base)
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)

    def finish(v, parent):
        child_times = []
        for c in adj[v]:
            if c != parent:
                child_times.append(finish(c, v))
        if not child_times:
            return base[v]
        earliest = min(child_times)
        latest = max(child_times)
        return 2 * latest - earliest + base[v]

    best = None
    for r in range(n):
        f = finish(r, -1)
        if best is None or f < best:
            best = f
    return best
`

const pyLines = python.split('\n').map((text, index) => ({ line: index + 1, text }))
