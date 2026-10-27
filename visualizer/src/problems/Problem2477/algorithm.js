export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with roads and seats.')
  const { roads, seats } = data
  if (!Number.isInteger(seats) || seats < 1 || seats > 5) throw new Error('seats must be an integer from 1 to 5.')
  if (!Array.isArray(roads) || roads.length > 9) throw new Error('roads must list at most 9 pairs of cities.')
  const n = roads.length + 1
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = v => (parent[v] === v ? v : (parent[v] = find(parent[v])))
  for (const road of roads) {
    if (!Array.isArray(road) || road.length !== 2 || !road.every(v => Number.isInteger(v) && v >= 0 && v < n)) throw new Error(`Each road joins two cities from 0 to ${n - 1}.`)
    const [a, b] = road
    if (find(a) === find(b)) throw new Error('The roads must form a tree that reaches every city: no cycles.')
    parent[find(a)] = find(b)
  }
  return { roads, seats }
}

export function buildTrace(input) {
  const { roads, seats } = input
  const n = roads.length + 1
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of roads) { adj[a].push(b); adj[b].push(a) }
  const frames = []
  let total = 0
  const tags = {}
  const frame = (phase, line, city, people, message) => frames.push({ phase, activeLine: line, node: city, people, total, tags: { ...tags }, message })
  frame('start', L('set total fuel to 0'), null, null, `Start at the capital, city 0. Each city sends its people toward the capital.`)
  const count = (city, parentCity) => {
    let people = 1
    frame('enter', L('set people to 1'), city, people, `City ${city} starts with its own representative.`)
    for (const next of adj[city]) {
      if (next === parentCity) continue
      people += count(next, city)
    }
    if (city !== 0) {
      const cars = Math.ceil(people / seats)
      total += cars
      tags[city] = `${people} people, ${cars} car${cars === 1 ? '' : 's'}`
      frame('charge', L('add the ceiling'), city, people, `${people} people leave city ${city} with ${seats} seats per car, so ${cars} car${cars === 1 ? '' : 's'} travel up.`)
    }
    return people
  }
  count(0, -1)
  frame('done', L('return total fuel'), null, null, `The minimum fuel is ${total}.`)
  return { input, result: total, frames }
}

export const code = `minimum fuel to report to the capital, which is city 0
  build a neighbour list for each city from the roads
  set total fuel to 0
  call count on city 0 with no parent
  return total fuel

count(city, parent)
  set people to 1 for this city
  for each neighbour of city except parent, do
    add the people returned by count on that neighbour to people
  if city is not the capital then
    add the ceiling of people divided by seats to total fuel
  return people`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_fuel(roads, seats):
    n = len(roads) + 1
    adj = [[] for _ in range(n)]
    for a, b in roads:
        adj[a].append(b)
        adj[b].append(a)
    total = 0

    def count(city, parent):
        nonlocal total
        people = 1
        for nxt in adj[city]:
            if nxt != parent:
                people += count(nxt, city)
        if city != 0:
            total += -(-people // seats)
        return people

    count(0, -1)
    return total
`
