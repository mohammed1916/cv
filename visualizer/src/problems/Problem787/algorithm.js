import { TracedHeap, heapView } from '../../components/shared/heapModel.js'
export function parseInput(text) {
  const v = JSON.parse(text)
  const err = 'Enter {"n":4,"flights":[[0,1,100]],"src":0,"dst":3,"k":1}: 2 <= n <= 10, at most 30 flights [from,to,price>=1] with no repeated pair or self-flight, src != dst, 0 <= k < n.'
  if (!v || typeof v !== 'object' || !Array.isArray(v.flights)) throw new Error(err)
  const { n, flights, src, dst, k } = v
  if (![n, src, dst, k].every(Number.isInteger) || n < 2 || n > 10 || flights.length > 30 || src === dst || src < 0 || dst < 0 || src >= n || dst >= n || k < 0 || k >= n) throw new Error(err)
  const seen = new Set()
  for (const f of flights) {
    if (!Array.isArray(f) || f.length !== 3 || !f.every(Number.isInteger)) throw new Error(err)
    const [a, b, w] = f
    if (a < 0 || b < 0 || a >= n || b >= n || a === b || w < 1 || w > 10000 || seen.has(`${a},${b}`)) throw new Error(err)
    seen.add(`${a},${b}`)
  }
  return { n, flights, src, dst, k }
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
export function buildTrace({ n, flights, src, dst, k }) {
  const graph = Array.from({ length: n }, () => [])
  for (const [u, v, w] of flights) graph[u].push([v, w])
  const seen = new Array(n).fill(k + 2)
  const heap = new TracedHeap(cmp, { format: ([c, s, u]) => `$${c} @${u} (${s})` })
  heap.push([0, 0, src])
  const best = new Array(n).fill(Infinity)
  best[src] = 0
  const fmt = h => h.slice(0, 12).map(([c, s, u]) => `$${c} @${u} (${s})`)
  const PYL = { 3: 8, 7: 12, 8: 14, 10: 10, 11: 17, 12: 18 }
  const mk = (phase, activeLine, message, extra = {}) => ({ phase, activeLine, pythonLine: PYL[activeLine], message, heap: fmt(heap.data), heapState: heapView(heap, { title: 'Priority queue (root = cheapest; entries are $cost @city (flights used))' }).heap, more: Math.max(0, heap.size - 12), seen: seen.map(x => x === k + 2 ? '-' : x), cur: null, best: [...best], ops: [], ...extra })
  const frames = [mk('start', 3, `Push (cost 0, stops 0, city ${src}). Entries are (cost, edges used, city); the cheapest cost pops first. At most ${k + 1} flights are allowed.`)]
  let result = -1
  while (heap.size) {
    const [cost, stops, u] = heap.pop()
    if (u === dst) {
      result = cost
      frames.push(mk('found', 7, `Popped destination ${dst} with cost ${cost}. Heap order guarantees no cheaper valid route exists.`, { cur: [cost, stops, u] }))
      break
    }
    if (stops >= seen[u] || stops > k) {
      frames.push(mk('skip', 8, stops > k ? `City ${u} was reached with ${stops} flights, so one more would exceed ${k + 1}: skip.` : `City ${u} was already expanded with ${seen[u]} flights at lower or equal cost, so this ${stops}-flight state is dominated: skip.`, { cur: [cost, stops, u] }))
      continue
    }
    seen[u] = stops
    frames.push(mk('pop', 10, `Pop (cost ${cost}, flights ${stops}) at city ${u} and expand its ${graph[u].length} outgoing flight(s).`, { cur: [cost, stops, u], ops: [{ type: 'pop', node: u, dist: cost }] }))
    for (const [v, w] of graph[u]) {
      const old = best[v]
      heap.push([cost + w, stops + 1, v])
      const improved = cost + w < old
      if (improved) best[v] = cost + w
      frames.push(mk('push', 11, `Push flight ${u} to ${v}: cost ${cost} + ${w} = ${cost + w} using ${stops + 1} flight(s).`, { cur: [cost + w, stops + 1, v], from: u, flight: [u, v, w], ops: [{ type: 'relax', u, v, w, base: cost, candidate: cost + w, old, result: improved ? 'improved' : 'kept' }, { type: 'push', node: v, dist: cost + w }] }))
    }
  }
  frames.push(mk('done', result >= 0 ? 7 : 12, result >= 0 ? `Cheapest price: ${result}.` : `Destination unreachable within ${k} stops: return -1.`, { cur: null }))
  return { input: { n, flights, src, dst, k }, result, frames }
}
export const code = `set graph to the adjacency lists built from flights
set seen[city] to k + 2 for every city
push (0, 0, src) onto a min-heap of (cost, flights, city)
while the heap is not empty
  pop (cost, stops, u) with the smallest cost
  if u equals dst then
    return cost
  if stops >= seen[u] or stops > k then continue to the next pop
  set seen[u] to stops
  for each flight (v, w) out of u
    push (cost + w, stops + 1, v)
return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `import heapq

def find_cheapest_price(n, flights, src, dst, k):
    graph = [[] for _ in range(n)]
    for u, v, w in flights:
        graph[u].append((v, w))
    seen = [k + 2] * n
    heap = [(0, 0, src)]
    while heap:
        cost, stops, u = heapq.heappop(heap)
        if u == dst:
            return cost
        if stops >= seen[u] or stops > k:
            continue
        seen[u] = stops
        for v, w in graph[u]:
            heapq.heappush(heap, (cost + w, stops + 1, v))
    return -1
`
