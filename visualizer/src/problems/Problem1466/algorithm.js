// Teaching model written for this visualizer. The sample roads and wording are original.
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

const CODE = [
  'function minReorder(n, connections) {',
  '  const adj = Array.from({ length: n }, () => [])',
  '  for (const [a, b] of connections) {',
  '    adj[a].push([b, 1])',
  '    adj[b].push([a, 0])',
  '  }',
  '  const visited = Array(n).fill(false)',
  '  visited[0] = true',
  '  const stack = [0]',
  '  let count = 0',
  '  while (stack.length > 0) {',
  '    const city = stack.pop()',
  '    for (const [next, cost] of adj[city]) {',
  '      if (visited[next]) continue',
  '      visited[next] = true',
  '      count += cost',
  '      stack.push(next)',
  '    }',
  '  }',
  '  return count',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(text => text.includes(s)) + 1

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

export function buildTrace({ n, connections }) {
  const adj = Array.from({ length: n }, () => [])
  const visited = Array(n).fill(false)
  const seen = () => visited.map((on, city) => (on ? city : -1)).filter(city => city >= 0)
  const frames = [{ phase: 'start', activeLine: L('let count = 0'), pythonLine: 9, city: null, from: null, visited: [], stack: [], count: 0, message: 'Roads that point away from city zero must be reversed. Count them while searching outward from city zero.' }]

  for (const [a, b] of connections) {
    adj[a].push([b, 1])
    adj[b].push([a, 0])
  }
  frames.push({ phase: 'build', activeLine: L('for (const [a, b]'), pythonLine: 3, city: null, from: null, visited: [], stack: [], count: 0, message: 'Each road is recorded both ways. Walking it in its drawn direction costs 1; walking against it costs 0.' })

  visited[0] = true
  const stack = [0]
  let count = 0
  frames.push({ phase: 'push', activeLine: L('visited[0] = true'), pythonLine: 7, city: 0, from: null, visited: seen(), stack: [...stack], count, message: 'Start the search at city zero.' })
  while (stack.length) {
    const city = stack.pop()
    frames.push({ phase: 'pop', activeLine: L('const city = stack.pop()'), pythonLine: 11, city, from: null, visited: seen(), stack: [...stack], count, message: `Take city ${city} from the stack and look at its roads.` })
    for (const [next, cost] of adj[city]) {
      if (visited[next]) continue
      visited[next] = true
      count += cost
      stack.push(next)
      frames.push({
        phase: 'road', activeLine: L('count += cost'), pythonLine: 15, city: next, from: city, visited: seen(), stack: [...stack], count,
        message: cost === 1 ? `Road from ${city} to ${next} points away from city zero, so it is reversed (count ${count}).` : `Road between ${city} and ${next} already points toward city zero.`,
      })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: 17, city: null, from: null, visited: seen(), stack: [], count, message: `Reversals needed: ${count}.` })
  return { input: { n, connections }, result: count, frames }
}
