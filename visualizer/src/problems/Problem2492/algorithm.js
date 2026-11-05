export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input?.n) || input.n < 2 || input.n > 8) throw new Error('n is an integer from 2 to 8.')
  if (!Array.isArray(input.roads) || input.roads.length < 1 || input.roads.length > 12) throw new Error('roads has 1 to 12 entries.')
  input.roads.forEach(r => {
    if (!Array.isArray(r) || r.length !== 3 || ![r[0], r[1]].every(v => Number.isInteger(v) && v >= 1 && v <= input.n) || r[0] === r[1]) throw new Error('Each road is [a, b, distance] between two different cities.')
    if (!Number.isInteger(r[2]) || r[2] < 1 || r[2] > 9999) throw new Error('Each distance is an integer from 1 to 9999.')
  })
  const seen = new Set(), parent = Array.from({ length: input.n + 1 }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  input.roads.forEach(([a, b]) => { parent[find(a)] = find(b) })
  if (find(1) !== find(input.n)) throw new Error('Cities 1 and n must be connected.')
  return { n: input.n, roads: input.roads }
}

export const code = `function minScore(n, roads)
  adj <- for each city, the roads leaving it as (neighbour, distance)
  best <- infinity
  queue <- [1], seen <- {1}
  while the queue is not empty
    u <- take the first city from the queue
    for each road (v, d) leaving u
      best <- the smaller of best and d
      if v is not seen yet, mark it seen and append v to the queue
  RETURN best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `from collections import deque

def min_score(n, roads):
    adj = [[] for _ in range(n + 1)]
    for a, b, d in roads:
        adj[a].append((b, d))
        adj[b].append((a, d))
    best = float("inf")
    queue, seen = deque([1]), {1}
    while queue:
        u = queue.popleft()
        for v, d in adj[u]:
            best = min(best, d)
            if v not in seen:
                seen.add(v)
                queue.append(v)
    return best
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export function buildTrace({ n, roads }) {
  const adj = Array.from({ length: n + 1 }, () => [])
  roads.forEach(([a, b, d]) => { adj[a].push([b, d]); adj[b].push([a, d]) })
  let best = Infinity
  const queue = [1]
  const seen = new Set([1])
  const frames = []
  const snap = (fields) => frames.push({ n, roads, best: Number.isFinite(best) ? best : null, queue: [...queue], visited: [...seen], current: null, neighbour: null, edgeTo: null, ...fields })
  snap({ phase: 'start', activeLine: CL('queue <- [1]'), pythonLine: PL('queue, seen'), message: 'Start at city 1 and collect every road reachable from it.' })
  while (queue.length) {
    const u = queue.shift()
    snap({ phase: 'pop', activeLine: CL('take the first'), pythonLine: PL('u = queue.popleft()'), current: u, message: `Visit city ${u}.` })
    for (const [v, d] of adj[u]) {
      best = Math.min(best, d)
      snap({ phase: 'edge', activeLine: CL('best <- the smaller'), pythonLine: PL('best = min(best, d)'), current: u, neighbour: v, edgeTo: d, message: `Road ${u}-${v} has distance ${d}; the smallest so far is ${best}.` })
      if (!seen.has(v)) {
        seen.add(v)
        queue.push(v)
        snap({ phase: 'edge', activeLine: CL('mark it seen'), pythonLine: PL('seen.add(v)'), current: u, neighbour: v, edgeTo: d, message: `City ${v} is new; it joins the queue.` })
      }
    }
  }
  snap({ phase: 'done', activeLine: CL('RETURN best'), pythonLine: PL('return best'), current: null, neighbour: null, message: `Every reachable road was examined. The answer is ${best}.`, result: best })
  return { input: { n, roads }, result: best, frames }
}
