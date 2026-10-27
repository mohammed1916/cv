const ERROR = 'Enter {"start":[x,y],"target":[x,y],"special_roads":[[x1,y1,x2,y2,cost],...]} with 1 to 5 roads. Coordinates are 0 to 20 and each cost is 1 to 30.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.start) || !Array.isArray(value.target) || !Array.isArray(value.special_roads)) throw new Error(ERROR)
  const { start, target, special_roads: roads } = value
  const pointOk = p => p.length === 2 && p.every(v => Number.isInteger(v) && v >= 0 && v <= 20)
  if (!pointOk(start) || !pointOk(target) || roads.length < 1 || roads.length > 5) throw new Error(ERROR)
  const roadOk = r => Array.isArray(r) && r.length === 5 && pointOk([r[0], r[1]]) && pointOk([r[2], r[3]]) && Number.isInteger(r[4]) && r[4] >= 1 && r[4] <= 30
  if (!roads.every(roadOk)) throw new Error(ERROR)
  return { start, target, special_roads: roads }
}

export const code = `minimum cost from start to target
points = start, target, and both ends of every special road, without repeats
dist[start] = 0 and every other dist = infinity
heap = [(0, start)]
while the heap is not empty
  pop (d, p) with the smallest d
  if p is the target then return d
  if d > dist[p] then continue
  for each point q
    walking from p to q costs |px - qx| + |py - qy|
    if d + walk < dist[q] then record it and push it
  for each special road from p to e with cost c
    if d + c < dist[e] then record it and push it
return dist[target]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ start, target, special_roads: roads }) {
  const keys = [start, target]
  for (const [x1, y1, x2, y2] of roads) keys.push([x1, y1], [x2, y2])
  const points = []
  const seen = new Set()
  for (const p of keys) { const k = `${p[0]},${p[1]}`; if (!seen.has(k)) { seen.add(k); points.push([p[0], p[1]]) } }
  const at = p => points.findIndex(q => q[0] === p[0] && q[1] === p[1])
  const goal = at(target)
  const roadsFrom = points.map(() => [])
  for (const [x1, y1, x2, y2, cost] of roads) roadsFrom[at([x1, y1])].push([at([x2, y2]), cost])
  const dist = new Array(points.length).fill(Infinity)
  dist[0] = 0
  const settled = new Array(points.length).fill(false)
  const frames = [{ phase: 'start', activeLine: L('dist[start] = 0'), point: 0, dist: [...dist], settled: [...settled], message: `${points.length} point(s) to consider: the start, the target and each special road endpoint. Walking between any two points costs their Manhattan distance.` }]
  let result = null
  for (;;) {
    let i = -1
    for (let x = 0; x < points.length; x++) if (!settled[x] && dist[x] < Infinity && (i === -1 || dist[x] < dist[i])) i = x
    if (i === -1) break
    if (i === goal) { result = dist[i]; break }
    settled[i] = true
    const [px, py] = points[i]
    const d = dist[i]
    points.forEach((q, j) => { const step = d + Math.abs(px - q[0]) + Math.abs(py - q[1]); if (step < dist[j]) dist[j] = step })
    for (const [j, cost] of roadsFrom[i]) if (d + cost < dist[j]) dist[j] = d + cost
    frames.push({ phase: 'settle', activeLine: L('pop (d, p)'), point: i, dist: [...dist], settled: [...settled], message: `Settle point (${px}, ${py}) at cost ${d}. Walks reach each other point, and special roads from here cost their listed price.` })
  }
  if (result === null) result = dist[goal]
  frames.push({ phase: 'done', activeLine: L('return dist[target]'), point: goal, dist: [...dist], settled: [...settled], message: `Minimum cost from start to target: ${result}.` })
  return { input: { start, target, special_roads: roads }, points, result, frames }
}

export const python = `import heapq

def minimum_cost(start, target, special_roads):
    points = [tuple(start), tuple(target)]
    for x1, y1, x2, y2, _ in special_roads:
        points.append((x1, y1))
        points.append((x2, y2))
    points = list(dict.fromkeys(points))
    index = {p: i for i, p in enumerate(points)}
    roads = [[] for _ in points]
    for x1, y1, x2, y2, cost in special_roads:
        roads[index[(x1, y1)]].append((index[(x2, y2)], cost))
    goal = index[tuple(target)]
    dist = [float('inf')] * len(points)
    dist[0] = 0
    heap = [(0, 0)]
    while heap:
        d, i = heapq.heappop(heap)
        if i == goal:
            return d
        if d > dist[i]:
            continue
        px, py = points[i]
        for j, (qx, qy) in enumerate(points):
            step = d + abs(px - qx) + abs(py - qy)
            if step < dist[j]:
                dist[j] = step
                heapq.heappush(heap, (step, j))
        for j, cost in roads[i]:
            if d + cost < dist[j]:
                dist[j] = d + cost
                heapq.heappush(heap, (d + cost, j))
    return dist[goal]
`
