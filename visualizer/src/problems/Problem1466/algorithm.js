export function parseInput(text) {
  const input = JSON.parse(text)
  const n = input?.n
  const connections = input?.connections
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('Use n cities, an integer from 2 to 12.')
  if (!Array.isArray(connections) || connections.length !== n - 1) throw new Error('Use exactly n - 1 roads so the cities form a tree.')
  for (const pair of connections) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(c => Number.isInteger(c) && c >= 0 && c < n) || pair[0] === pair[1]) {
      throw new Error('Each road is a pair of different cities numbered 0 to n - 1.')
    }
  }
  // Every city must be reachable from city zero when roads are read without direction.
  const linked = Array.from({ length: n }, () => [])
  for (const [a, b] of connections) {
    linked[a].push(b)
    linked[b].push(a)
  }
  const seen = new Set([0])
  const stack = [0]
  while (stack.length) for (const next of linked[stack.pop()]) if (!seen.has(next)) { seen.add(next); stack.push(next) }
  if (seen.size !== n) throw new Error('Every city must be connected to city zero.')
  return { n, connections }
}

export function buildTrace({ n, connections }) {
  const adj = Array.from({ length: n }, () => [])
  const visited = Array(n).fill(false)
  const seen = () => visited.map((on, city) => (on ? city : -1)).filter(city => city >= 0)
  const frames = [{ phase: 'start', activeLine: L('count reversals so all cities reach city zero'), city: null, visited: [], count: 0, message: 'Roads that point away from city zero must be reversed. Roads that point toward it are fine.' }]

  for (const [a, b] of connections) {
    adj[a].push([b, 1])
    adj[b].push([a, 0])
  }
  frames.push({ phase: 'build', activeLine: L('for each road a to b'), city: null, visited: [], count: 0, message: 'Each road is recorded both ways. Walking it in its drawn direction costs 1; walking against it costs 0.' })

  visited[0] = true
  const stack = [0]
  let count = 0
  frames.push({ phase: 'push', activeLine: L('push city zero onto a stack'), city: 0, visited: seen(), count, message: 'Start the search at city zero.' })
  while (stack.length) {
    const city = stack.pop()
    frames.push({ phase: 'pop', activeLine: L('pop a city'), city, visited: seen(), count, message: `Look at the roads leaving city ${city}.` })
    for (const [next, cost] of adj[city]) {
      if (visited[next]) continue
      visited[next] = true
      count += cost
      stack.push(next)
      frames.push({
        phase: 'road', activeLine: L('add the neighbour cost'), city: next, visited: seen(), count,
        message: cost === 1 ? `Road from ${city} to ${next} points away from city zero, so it is reversed (count ${count}).` : `Road between ${city} and ${next} already points toward city zero.`,
      })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the count'), city: null, visited: seen(), count, message: `Reversals needed: ${count}.` })
  return { input: { n, connections }, result: count, frames }
}

export const code = `count reversals so all cities reach city zero
  for each road a to b, record b as a neighbour of a with cost 1, and a as a neighbour of b with cost 0
  push city zero onto a stack and mark it visited
  while the stack is not empty
    pop a city
    for each neighbour that is not visited
      add the neighbour cost to the count
      mark the neighbour visited and push it onto the stack
  return the count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_reorders(n, connections):
    adj = [[] for _ in range(n)]
    for a, b in connections:
        adj[a].append((b, 1))
        adj[b].append((a, 0))
    visited = [False] * n
    visited[0] = True
    stack = [0]
    count = 0
    while stack:
        city = stack.pop()
        for nxt, cost in adj[city]:
            if not visited[nxt]:
                visited[nxt] = True
                count += cost
                stack.append(nxt)
    return count
`
