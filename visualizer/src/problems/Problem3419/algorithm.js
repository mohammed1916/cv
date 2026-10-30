export const python = `from collections import deque

def minMaxWeight(n, edges, threshold):
    # Each node keeps only its BFS parent edge (one outgoing edge), which fits any threshold >= 1.
    weights = sorted({w for _, _, w in edges})
    lo, hi, answer = 0, len(weights) - 1, -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if reaches_zero(n, edges, weights[mid]):
            answer = weights[mid]
            hi = mid - 1
        else:
            lo = mid + 1
    return answer

def reaches_zero(n, edges, limit):
    rev = [[] for _ in range(n)]
    for u, v, w in edges:
        if w <= limit:
            rev[v].append(u)
    seen = [False] * n
    seen[0] = True
    queue = deque([0])
    while queue:
        v = queue.popleft()
        for u in rev[v]:
            if not seen[u]:
                seen[u] = True
                queue.append(u)
    return all(seen)
`

const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const code = [
  'FUNCTION minMaxWeight(n, edges, threshold)',
  'weights ← sorted distinct edge weights',
  'lo ← 0, hi ← last index, answer ← −1',
  'WHILE lo ≤ hi',
  'mid ← floor((lo + hi) / 2)',
  'IF reachesZero(n, edges, weights[mid]) THEN',
  'answer ← weights[mid]',
  'hi ← mid − 1',
  'ELSE lo ← mid + 1',
  'RETURN answer',
  'FUNCTION reachesZero(n, edges, limit)',
  'build reverse adjacency from edges with weight ≤ limit',
  'mark node 0 seen and queue it',
  'WHILE queue is not empty',
  'v ← pop front of queue',
  'FOR EACH u in rev[v]',
  'IF u is not seen THEN mark u seen and queue it',
  'RETURN true when every node is seen',
].map((text, index) => ({ line: index + 1, text }))

export function parseInput(text) {
  const data = typeof text === 'string' ? JSON.parse(text) : text
  if (!data || typeof data !== 'object') throw new Error('Use a JSON object with n, edges and threshold.')
  const { n, edges, threshold } = data
  if (!Number.isInteger(n) || n < 2 || n > 8) throw new Error('n must be an integer from 2 to 8 for this visualization.')
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > n - 1) throw new Error('threshold must be an integer from 1 to n - 1.')
  if (!Array.isArray(edges) || edges.length < 1 || edges.length > 16) throw new Error('edges must contain 1 to 16 [from, to, weight] entries.')
  edges.forEach((edge, index) => {
    if (!Array.isArray(edge) || edge.length !== 3) throw new Error(`edges[${index}] must be [from, to, weight].`)
    const [from, to, weight] = edge
    if (![from, to, weight].every(Number.isInteger)) throw new Error(`edges[${index}] must contain integers.`)
    if (from < 0 || from >= n || to < 0 || to >= n) throw new Error(`edges[${index}] endpoints must be between 0 and n - 1.`)
    if (from === to) throw new Error(`edges[${index}] cannot be a self-loop.`)
    if (weight < 1 || weight > 20) throw new Error(`edges[${index}] weight must be between 1 and 20 for this visualization.`)
  })
  return { n, edges: edges.map(([from, to, weight]) => [from, to, weight]), threshold }
}

function reachesZero(n, edges, limit) {
  const steps = []
  const rev = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) if (w <= limit) rev[v].push(u)
  steps.push({ activeLine: 12, pythonLine: P('rev = [[] for'), message: `Build reverse adjacency for edges with weight <= ${limit}.`, seen: [], queue: [], current: null, neighbour: null })
  const seen = Array(n).fill(false)
  seen[0] = true
  const queue = [0]
  const seenList = () => seen.flatMap((value, index) => (value ? [index] : []))
  steps.push({ activeLine: 13, pythonLine: P('seen = [False]'), message: 'Node 0 is the target. Mark it seen and queue it.', seen: seenList(), queue: [...queue], current: null, neighbour: null })
  while (queue.length) {
    const v = queue.shift()
    steps.push({ activeLine: 15, pythonLine: P('v = queue.popleft()'), message: `Pop node ${v}. Any node with an allowed edge into ${v} can reach 0 through it.`, seen: seenList(), queue: [...queue], current: v, neighbour: null })
    for (const u of rev[v]) {
      if (seen[u]) continue
      seen[u] = true
      queue.push(u)
      steps.push({ activeLine: 17, pythonLine: P('seen[u] = True'), message: `Node ${u} has an allowed edge to ${v}, so it can reach 0. Queue it.`, seen: seenList(), queue: [...queue], current: v, neighbour: u })
    }
  }
  const ok = seen.every(Boolean)
  steps.push({ activeLine: 18, pythonLine: P('return all(seen)'), message: ok ? `Every node reaches 0 with weights <= ${limit}.` : `Some node cannot reach 0 with weights <= ${limit}.`, seen: seenList(), queue: [], current: null, neighbour: null })
  return { ok, steps }
}

export function buildTrace(input) {
  const { n, edges, threshold } = input
  const weights = [...new Set(edges.map(edge => edge[2]))].sort((a, b) => a - b)
  const frames = []
  const usableFor = limit => edges.filter(edge => edge[2] <= limit).map(([from, to]) => [from, to])
  frames.push({ phase: 'setup', activeLine: 2, pythonLine: P('weights = sorted'), message: `Candidate answers are the distinct weights ${weights.join(', ')}. Every node keeps one outgoing edge, which fits threshold ${threshold}.`, limit: null, seen: [], queue: [], current: null, neighbour: null, usable: [] })
  let lo = 0
  let hi = weights.length - 1
  let answer = -1
  frames.push({ phase: 'search', activeLine: 3, pythonLine: P('lo, hi, answer'), message: `Search range [${lo}, ${hi}] over the candidate weights.`, limit: null, seen: [], queue: [], current: null, neighbour: null, usable: [] })
  while (lo <= hi) {
    frames.push({ phase: 'search', activeLine: 4, pythonLine: P('while lo <= hi'), message: `Search continues while lo=${lo} <= hi=${hi}.`, limit: null, seen: [], queue: [], current: null, neighbour: null, usable: [] })
    const mid = Math.floor((lo + hi) / 2)
    const limit = weights[mid]
    frames.push({ phase: 'search', activeLine: 5, pythonLine: P('mid = (lo + hi)'), message: `Try limit ${limit}: keep only edges with weight <= ${limit}.`, limit, seen: [], queue: [], current: null, neighbour: null, usable: usableFor(limit) })
    const { ok, steps } = reachesZero(n, edges, limit)
    for (const step of steps) frames.push({ phase: 'check', ...step, limit, usable: usableFor(limit) })
    if (ok) {
      answer = limit
      frames.push({ phase: 'record', activeLine: 7, pythonLine: P('answer = weights[mid]'), message: `Limit ${limit} works, so try smaller weights.`, limit, seen: [], queue: [], current: null, neighbour: null, usable: usableFor(limit) })
      frames.push({ phase: 'record', activeLine: 8, pythonLine: P('hi = mid - 1'), message: `Move hi down to ${mid - 1}.`, limit, seen: [], queue: [], current: null, neighbour: null, usable: usableFor(limit) })
      hi = mid - 1
    } else {
      frames.push({ phase: 'record', activeLine: 9, pythonLine: P('lo = mid + 1'), message: `Limit ${limit} fails, so raise lo to ${mid + 1}.`, limit, seen: [], queue: [], current: null, neighbour: null, usable: usableFor(limit) })
      lo = mid + 1
    }
  }
  frames.push({ phase: 'done', activeLine: 10, pythonLine: P('return answer'), message: answer === -1 ? 'No limit works, so the answer is -1.' : `Return ${answer}: the smallest limit where every node reaches 0.`, limit: answer === -1 ? null : answer, seen: [], queue: [], current: null, neighbour: null, usable: answer === -1 ? [] : usableFor(answer), result: answer })
  return { input, result: answer, frames }
}
