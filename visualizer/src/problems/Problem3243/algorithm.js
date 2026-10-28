export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.queries)) throw new Error('Use an object with n and a queries array of [u, v] pairs.')
  const { n, queries } = input
  if (!Number.isInteger(n) || n < 3 || n > 12) throw new Error('n is an integer from 3 to 12.')
  if (queries.length < 1 || queries.length > 8) throw new Error('queries holds 1 to 8 pairs.')
  const seen = new Set()
  for (const pair of queries) {
    if (!Array.isArray(pair) || pair.length !== 2) throw new Error('Each query is [u, v].')
    const [u, v] = pair
    if (!Number.isInteger(u) || !Number.isInteger(v) || u < 0 || v >= n || u >= v) throw new Error('Each query needs 0 <= u < v < n.')
    if (v === u + 1) throw new Error('A query cannot repeat the existing road from u to u plus 1.')
    const key = `${u},${v}`
    if (seen.has(key)) throw new Error('Queries must not repeat a road.')
    seen.add(key)
  }
  return { n, queries }
}

export function buildTrace(input) {
  const { n, queries } = input
  const adjacency = Array.from({ length: n }, (_, i) => (i + 1 < n ? [i + 1] : []))
  const frames = [{ phase: 'start', activeLine: L('connect each city'), query: -1, road: null, dist: null, active: -1, answers: [], message: `Start with the chain 0 to ${n - 1}.` }]
  const answers = []
  queries.forEach(([u, v], query) => {
    adjacency[u].push(v)
    frames.push({ phase: 'add', activeLine: L('add a one-way road'), query, road: [u, v], dist: null, active: -1, answers: [...answers], message: `Add the one-way road ${u} to ${v}.` })
    const dist = new Array(n).fill(-1)
    dist[0] = 0
    const queue = [0]
    for (let head = 0; head < queue.length; head++) {
      const city = queue[head]
      frames.push({ phase: 'search', activeLine: L('take the next city'), query, road: [u, v], dist: [...dist], active: city, answers: [...answers], message: `Visit city ${city} at distance ${dist[city]}.` })
      for (const next of adjacency[city]) {
        if (dist[next] === -1) { dist[next] = dist[city] + 1; queue.push(next) }
      }
    }
    answers.push(dist[n - 1])
    frames.push({ phase: 'answer', activeLine: L('append the distance'), query, road: [u, v], dist: [...dist], active: n - 1, answers: [...answers], message: `The shortest distance to city ${n - 1} is ${dist[n - 1]}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), query: -1, road: null, dist: null, active: -1, answers: [...answers], message: `Answers: ${answers.join(', ')}.` })
  return { input, result: answers, frames }
}

export const code = `shortest road distances after each new road
  connect each city i to city i plus one
  set answers to an empty list
  for each query [u, v] in order
    add a one-way road from u to v
    set every distance to minus one and the distance of city 0 to zero
    put city 0 in a queue
    while the queue is not empty
      take the next city from the front of the queue
      for each road from that city to a city with no distance yet
        set its distance to one more and add it to the queue
    append the distance to the last city to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def shortest_distance_after_queries(n, queries):
    adjacency = [[i + 1] if i + 1 < n else [] for i in range(n)]
    answers = []
    for u, v in queries:
        adjacency[u].append(v)
        dist = [-1] * n
        dist[0] = 0
        queue = deque([0])
        while queue:
            city = queue.popleft()
            for following in adjacency[city]:
                if dist[following] == -1:
                    dist[following] = dist[city] + 1
                    queue.append(following)
        answers.append(dist[n - 1])
    return answers
`
