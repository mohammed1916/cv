export const phases = [
  { id: 'start', label: 'Start shop', description: 'Each shop is tried as the place the trip begins.' },
  { id: 'distances', label: 'Distances', description: 'Find empty and carrying shortest costs from this start.' },
  { id: 'candidate', label: 'Candidate', description: 'Price buying at one shop and returning to the start.' },
  { id: 'store', label: 'Store', description: 'Keep the cheapest total for this start.' },
  { id: 'done', label: 'Result', description: 'Return one minimum per start shop.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with prices and roads.')
  const { prices, roads } = input
  if (!Array.isArray(prices) || prices.length < 2 || prices.length > 8) throw new Error('prices has 2 to 8 shops.')
  if (!prices.every(p => Number.isInteger(p) && p >= 1 && p <= 1e9)) throw new Error('Each price is an integer from 1 to 1000000000.')
  if (!Array.isArray(roads) || roads.length > 20) throw new Error('roads has at most 20 entries.')
  const seen = new Set()
  for (const road of roads) {
    if (!Array.isArray(road) || road.length !== 4) throw new Error('Each road is [a, b, cost, multiplier].')
    const [a, b, cost, mult] = road
    if (![a, b].every(x => Number.isInteger(x) && x >= 0 && x < prices.length) || a === b) throw new Error('Road endpoints must be different valid shop ids.')
    if (!Number.isInteger(cost) || cost < 1 || cost > 1000 || !Number.isInteger(mult) || mult < 1 || mult > 100) throw new Error('Road cost is 1 to 1000 and multiplier is 1 to 100.')
    const pairKey = `${Math.min(a, b)},${Math.max(a, b)}`
    if (seen.has(pairKey)) throw new Error('Each pair of shops has at most one road.')
    seen.add(pairKey)
  }
  return { prices, roads }
}

function shortest(n, roads, source, carrying) {
  const dist = Array(n).fill(Infinity)
  const done = Array(n).fill(false)
  dist[source] = 0
  for (let round = 0; round < n; round++) {
    let u = -1
    for (let v = 0; v < n; v++) if (!done[v] && dist[v] < Infinity && (u < 0 || dist[v] < dist[u])) u = v
    if (u < 0) break
    done[u] = true
    for (const [a, b, cost, mult] of roads) {
      const w = carrying ? cost * mult : cost
      if (a === u && dist[u] + w < dist[b]) dist[b] = dist[u] + w
      if (b === u && dist[u] + w < dist[a]) dist[a] = dist[u] + w
    }
  }
  return dist
}

export function buildTrace({ prices, roads }) {
  const n = prices.length
  const answers = []
  const frames = []
  frames.push({ phase: 'start', activeLine: L('let answers be empty'), pythonLine: P('answers = []'), message: 'Try every shop as the start. Buying at a shop costs its price, plus the empty trip there and the loaded trip back.', start: -1, j: -1, empty: null, carry: null, candidate: null, best: null, answers: [] })
  for (let s = 0; s < n; s++) {
    const empty = shortest(n, roads, s, false)
    const carry = shortest(n, roads, s, true)
    frames.push({ phase: 'distances', activeLine: L('let empty be'), pythonLine: P('empty = shortest(0, s)'), message: `From start ${s}: empty costs and loaded costs are computed.`, start: s, j: -1, empty: empty.slice(), carry: carry.slice(), candidate: null, best: null, answers: answers.slice() })
    let best = Infinity
    frames.push({ phase: 'candidate', activeLine: L('let best be infinity'), pythonLine: P('best = float'), message: `Start ${s} begins with no price found.`, start: s, j: -1, empty: empty.slice(), carry: carry.slice(), candidate: null, best: null, answers: answers.slice() })
    for (let j = 0; j < n; j++) {
      const candidate = prices[j] + empty[j] + carry[j]
      if (candidate < best) best = candidate
      frames.push({ phase: 'candidate', activeLine: L('set best to the smaller'), pythonLine: P('best = min(best'), message: `Buy at shop ${j}: price ${prices[j]} plus ${empty[j]} empty and ${carry[j]} loaded makes ${candidate}.`, start: s, j, empty: empty.slice(), carry: carry.slice(), candidate, best, answers: answers.slice() })
    }
    answers.push(best)
    frames.push({ phase: 'store', activeLine: L('add best to answers'), pythonLine: P('answers.append(best)'), message: `The cheapest total for start ${s} is ${best}.`, start: s, j: -1, empty: empty.slice(), carry: carry.slice(), candidate: null, best, answers: answers.slice() })
  }
  frames.push({ phase: 'done', activeLine: L('return answers'), pythonLine: P('return answers'), message: 'Every start shop has its minimum.', start: -1, j: -1, empty: null, carry: null, candidate: null, best: null, answers: answers.slice() })
  return { input: { prices, roads }, result: answers, frames }
}

export const code = `minimum cost to buy apples for each start shop
  let answers be empty
  for each start shop s
    let empty be the shortest empty-trip costs from s
    let carry be the shortest carrying costs from s
    let best be infinity
    for each shop j
      set best to the smaller of best and price[j] plus empty[j] plus carry[j]
    add best to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def min_apple_costs(prices, roads):
    n = len(prices)
    def shortest(weight_index, source):
        dist = [float('inf')] * n
        done = [False] * n
        dist[source] = 0
        for _ in range(n):
            u = -1
            for v in range(n):
                if not done[v] and dist[v] < float('inf') and (u < 0 or dist[v] < dist[u]):
                    u = v
            if u < 0:
                break
            done[u] = True
            for a, b, cost, mult in roads:
                w = cost if weight_index == 0 else cost * mult
                if a == u and dist[u] + w < dist[b]:
                    dist[b] = dist[u] + w
                if b == u and dist[u] + w < dist[a]:
                    dist[a] = dist[u] + w
        return dist
    answers = []
    for s in range(n):
        empty = shortest(0, s)
        carry = shortest(1, s)
        best = float('inf')
        for j in range(n):
            best = min(best, prices[j] + empty[j] + carry[j])
        answers.append(best)
    return answers`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
