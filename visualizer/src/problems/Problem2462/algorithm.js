export function parseInput(text) {
  const data = JSON.parse(text)
  const { costs, k, candidates } = data ?? {}
  if (!Array.isArray(costs) || costs.length < 1 || costs.length > 10) throw new Error('Use "costs" as an array of 1 to 10 workers.')
  if (costs.some(c => !Number.isInteger(c) || c < 1 || c > 20)) throw new Error('Each cost is an integer from 1 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > costs.length) throw new Error('"k" is an integer from 1 to the number of workers.')
  if (!Number.isInteger(candidates) || candidates < 1 || candidates > costs.length) throw new Error('"candidates" is an integer from 1 to the number of workers.')
  return { costs, k, candidates }
}

export function buildTrace({ costs, k, candidates }) {
  const n = costs.length
  let lo = Math.min(candidates, n)
  let hi = Math.max(n - candidates, candidates) - 1
  const front = Array.from({ length: lo }, (_, i) => i)
  const back = Array.from({ length: n - hi - 1 }, (_, i) => hi + 1 + i)
  const cheaper = (a, b) => costs[a] < costs[b] || (costs[a] === costs[b] && a < b)
  const cheapest = pool => pool.reduce((best, i) => (best === null || cheaper(i, best) ? i : best), null)
  const hired = []
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), picked: -1, front: [...front], back: [...back], hired: [], total, message: 'Split the workers into a front pool and a back pool of candidates.' }]
  for (let round = 0; round < k; round++) {
    const frontBest = cheapest(front)
    const backBest = cheapest(back)
    const fromFront = backBest === null || (frontBest !== null && cheaper(frontBest, backBest))
    const picked = fromFront ? frontBest : backBest
    if (fromFront) {
      front.splice(front.indexOf(picked), 1)
      if (lo <= hi) front.push(lo++)
    } else {
      back.splice(back.indexOf(picked), 1)
      if (lo <= hi) back.push(hi--)
    }
    hired.push(picked)
    total += costs[picked]
    frames.push({ phase: 'hire', activeLine: L('hire the cheaper one'), picked, front: [...front], back: [...back], hired: [...hired], total, message: `Hire worker ${picked} from the ${fromFront ? 'front' : 'back'} pool for ${costs[picked]}. Total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), picked: -1, front: [...front], back: [...back], hired: [...hired], total, message: `Total cost to hire ${k} workers: ${total}.` })
  return { input: { costs, k, candidates }, result: total, frames }
}

export const code = `total cost to hire k workers, given costs and candidates
  set total to 0
  put the first candidates workers into a front pool
  put the last candidates workers into a back pool, skipping any already in the front pool
  repeat k times
    find the cheapest worker in the front pool and the cheapest in the back pool
    hire the cheaper one, with ties going to the lower index
    add its cost to total
    move the next unassigned worker from that side into its pool
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def total_cost(costs, k, candidates):
    n = len(costs)
    lo = min(candidates, n)
    hi = max(n - candidates, candidates) - 1
    front = [(costs[i], i) for i in range(lo)]
    back = [(costs[i], i) for i in range(hi + 1, n)]
    heapq.heapify(front)
    heapq.heapify(back)
    total = 0
    for _ in range(k):
        if back and (not front or back[0] < front[0]):
            cost, _ = heapq.heappop(back)
            if lo <= hi:
                heapq.heappush(back, (costs[hi], hi))
                hi -= 1
        else:
            cost, _ = heapq.heappop(front)
            if lo <= hi:
                heapq.heappush(front, (costs[lo], lo))
                lo += 1
        total += cost
    return total
`
