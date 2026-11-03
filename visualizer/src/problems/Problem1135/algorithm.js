// Minimum cost to connect all cities with roads, using Kruskal's method:
// take roads from cheapest to most expensive and keep a road only when it joins two different groups.

const CITY_LIMIT = 8
const ROAD_LIMIT = 20
const COST_LIMIT = 1000

export const phases = [
  { id: 'start', label: 'Start', description: 'Give every city its own group.' },
  { id: 'sort', label: 'Sort roads', description: 'Order the roads from cheapest to most expensive.' },
  { id: 'consider', label: 'Consider road', description: 'Look at the next cheapest road and find the group of each end.' },
  { id: 'join', label: 'Join', description: 'The ends are in different groups, so build the road.' },
  { id: 'skip', label: 'Skip', description: 'The ends are already connected, so this road would form a loop.' },
  { id: 'done', label: 'Result', description: 'Return the total cost, or -1 when some city is unreachable.' },
]

export function parseInput(text) {
  let obj = text
  if (typeof obj === 'string') {
    try { obj = JSON.parse(obj) } catch { throw new Error('Use a JSON object with cities and roads.') }
  }
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.cities) || !Array.isArray(obj.roads)) {
    throw new Error('Use an object with an integer cities and a list roads of [a, b, cost].')
  }
  const { cities, roads } = obj
  if (cities < 1 || cities > CITY_LIMIT) throw new Error(`cities must be from 1 to ${CITY_LIMIT} in this visualization.`)
  if (roads.length > ROAD_LIMIT) throw new Error(`At most ${ROAD_LIMIT} roads in this visualization.`)
  for (const road of roads) {
    if (!Array.isArray(road) || road.length !== 3) throw new Error('Each road is [a, b, cost].')
    const [a, b, cost] = road
    if (![a, b].every(c => Number.isInteger(c) && c >= 1 && c <= cities)) throw new Error('Road ends are city numbers from 1 to cities.')
    if (!Number.isInteger(cost) || cost < 0 || cost > COST_LIMIT) throw new Error(`Road costs are integers from 0 to ${COST_LIMIT}.`)
  }
  return { cities, roads }
}

export const code = `minimum connection cost (cities, roads):
  sort roads by cost, cheapest first
  give each city its own group
  total = 0; used = 0
  for each road (a, b, cost) in sorted order:
    if a and b are in different groups then
      join the two groups; total = total + cost; used = used + 1
  if used equals cities - 1 then return total
  otherwise return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_cost(cities, roads):
    parent = list(range(cities + 1))

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    total = used = 0
    for a, b, cost in sorted(roads, key=lambda road: road[2]):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            total += cost
            used += 1
    return total if used == cities - 1 else -1
`

const P = text => python.split('\n').findIndex(line => line.includes(text)) + 1

export function buildTrace(input) {
  const { cities, roads } = parseInput(input)
  const parent = Array.from({ length: cities + 1 }, (_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  const snap = (extra = {}) => ({ parent: parent.slice(1), joined: [...extra.joined ?? []], total: extra.total ?? 0, current: extra.current ?? null })
  const frames = [{
    phase: 'start', activeLine: 3, pythonLine: P('parent = list('),
    message: `Start with ${cities} separate ${cities === 1 ? 'city' : 'cities'}.`,
    snapshot: snap(),
  }]
  const sorted = roads.map((road, index) => ({ road, index })).sort((p, q) => p.road[2] - q.road[2] || p.index - q.index)
  frames.push({
    phase: 'sort', activeLine: 1, pythonLine: P('sorted(roads'),
    message: `Sorted roads by cost: ${sorted.map(s => `${s.road[0]}-${s.road[1]} (${s.road[2]})`).join(', ') || 'none'}.`,
    snapshot: snap(),
  })
  const joined = []
  let total = 0
  for (const { road: [a, b, cost] } of sorted) {
    const ra = find(a)
    const rb = find(b)
    frames.push({
      phase: 'consider', activeLine: 5, pythonLine: P('ra, rb = find'),
      message: `Road ${a}-${b} costs ${cost}. ${ra !== rb ? 'Its ends are in different groups.' : 'Its ends are already in one group.'}`,
      snapshot: snap({ joined: [...joined], total, current: [a, b] }),
    })
    if (ra !== rb) {
      parent[ra] = rb
      total += cost
      joined.push([a, b])
      frames.push({
        phase: 'join', activeLine: 6, pythonLine: P('parent[ra] = rb'),
        message: `Build road ${a}-${b}. Total cost is now ${total}.`,
        snapshot: snap({ joined: [...joined], total, current: [a, b] }),
      })
    } else {
      frames.push({
        phase: 'skip', activeLine: 5, pythonLine: P('if ra != rb'),
        message: `Skip road ${a}-${b}. It would connect cities that are already linked.`,
        snapshot: snap({ joined: [...joined], total, current: [a, b] }),
      })
    }
  }
  const result = joined.length === cities - 1 ? total : -1
  frames.push({
    phase: 'done', activeLine: 7, pythonLine: P('return total if'),
    message: result === -1 ? `Only ${joined.length} road${joined.length === 1 ? '' : 's'} were built, so some city cannot be reached.` : `All cities are connected with total cost ${result}.`,
    snapshot: snap({ joined: [...joined], total, current: null }),
  })
  return { input: { cities, roads }, result, frames }
}
