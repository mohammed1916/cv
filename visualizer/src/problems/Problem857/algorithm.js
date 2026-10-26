export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Enter {"quality": [...], "wage": [...], "k": number}.')
  const { quality, wage, k } = v
  const okArr = a => Array.isArray(a) && a.every(x => Number.isInteger(x) && x >= 1 && x <= 10000)
  if (!okArr(quality) || !okArr(wage) || quality.length !== wage.length) throw new Error('quality and wage must be equal-length arrays of integers from 1 to 10000.')
  if (quality.length < 1 || quality.length > 30) throw new Error('Use 1 to 30 workers (visualization cap).')
  if (!Number.isInteger(k) || k < 1 || k > quality.length) throw new Error('k must be an integer between 1 and the number of workers.')
  return { quality, wage, k }
}

export function buildTrace({ quality, wage, k }) {
  const workers = quality.map((q, i) => ({ id: i, q, w: wage[i] }))
  workers.sort((a, b) => a.w * b.q - b.w * a.q)
  const heap = []
  let sumQ = 0, best = Infinity, bestIdx = -1
  const frames = []
  const f = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, index: -1, heap: heap.slice(), sumQ, best: Number.isFinite(best) ? best : null, bestIdx, cost: null, ...extra })
  f('start', 2, 'Sort workers by wage / quality. When worker i has the highest ratio in the group, everyone is paid at that ratio.')
  f('sort', 2, `Sorted order (worker id: quality, wage): ${workers.map(x => `${x.id}: ${x.q},${x.w}`).join(' | ')}`)
  workers.forEach((x, i) => {
    heap.push(x.q); heap.sort((a, b) => b - a); sumQ += x.q
    f('add', 5, `Worker ${x.id} (quality ${x.q}, ratio ${(x.w / x.q).toFixed(3)}) joins; it is the highest ratio so far. Quality sum ${sumQ}.`, { index: i })
    if (heap.length > k) {
      const removed = heap.shift(); sumQ -= removed
      f('evict', 6, `More than ${k} workers: drop the largest quality ${removed}, which is the most expensive to pay at this ratio. Quality sum ${sumQ}.`, { index: i })
    }
    if (heap.length === k) {
      const cost = sumQ * x.w / x.q
      const improved = cost < best
      if (improved) { best = cost; bestIdx = i }
      f('cost', 7, `Group of ${k}: cost = ${sumQ} * ${x.w}/${x.q} = ${cost.toFixed(5)}. ${improved ? 'New best.' : 'Not better than the best so far.'}`, { index: i, cost })
    }
  })
  f('done', 8, `Minimum cost to hire ${k} workers: ${best.toFixed(5)}.`, { index: workers.length - 1 })
  return { input: { quality, wage, k }, sorted: workers, result: best, frames }
}

export const code = `def mincostToHireWorkers(quality, wage, k):
    workers = sorted(zip(quality, wage), key=lambda x: x[1] / x[0])
    heap = []
    sum_q = 0
    best = float('inf')
    for q, w in workers:
        heappush(heap, -q); sum_q += q
        if len(heap) > k:
            sum_q += heappop(heap)
        if len(heap) == k:
            best = min(best, sum_q * w / q)
    return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
