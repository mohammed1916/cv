export function parseInput(text) {
  const data = JSON.parse(text)
  const robot = data?.robot
  const factory = data?.factory
  if (!Array.isArray(robot) || robot.length < 1 || robot.length > 5 || robot.some(p => !Number.isInteger(p) || Math.abs(p) > 20)) {
    throw new Error('robot must be 1 to 5 integer positions from -20 to 20.')
  }
  if (!Array.isArray(factory) || factory.length < 1 || factory.length > 3) throw new Error('factory must be 1 to 3 pairs of [position, limit].')
  let capacity = 0
  for (const f of factory) {
    if (!Array.isArray(f) || f.length !== 2 || !Number.isInteger(f[0]) || Math.abs(f[0]) > 20 || !Number.isInteger(f[1]) || f[1] < 1 || f[1] > 4) {
      throw new Error('Each factory is [position, limit] with a position from -20 to 20 and a limit from 1 to 4.')
    }
    capacity += f[1]
  }
  if (capacity < robot.length) throw new Error('The factories must have enough repair limit for every robot.')
  return { robot, factory }
}

export const code = `minimum total distance(robot, factory)
  sort robot positions and sort factories by position
  ways[i][j] = minimum distance using the first i factories to repair the first j robots
  set ways[0][0] = 0, and ways[0][j] = infinity for j > 0
  for i from 1 to number of factories
    pos, limit = factory i
    for j from 0 to number of robots
      ways[i][j] = ways[i - 1][j]
      cost = 0
      for k from 1 to min(limit, j)
        cost = cost + distance from robot j - k + 1 to pos
        ways[i][j] = min(ways[i][j], ways[i - 1][j - k] + cost)
  return ways[factories][robots]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Robots are sorted, so a factory takes a contiguous block of them; the block grows by one robot each time k grows.
export function buildTrace({ robot, factory }) {
  const robots = [...robot].sort((a, b) => a - b)
  const factories = [...factory].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const m = robots.length
  const F = factories.length
  const ways = Array.from({ length: F + 1 }, () => Array(m + 1).fill(Infinity))
  ways[0][0] = 0
  const show = () => ways.map(row => row.map(v => (Number.isFinite(v) ? v : '∞')))
  const frames = [{ phase: 'start', cell: [0, 0], table: show(), activeLine: L('set ways[0][0] = 0'), message: 'Using no factories, only the empty set of robots can be repaired, at no cost.' }]
  for (let i = 1; i <= F; i++) {
    const [pos, limit] = factories[i - 1]
    for (let j = 0; j <= m; j++) {
      ways[i][j] = ways[i - 1][j]
      let cost = 0
      for (let k = 1; k <= Math.min(limit, j); k++) {
        cost += Math.abs(robots[j - k] - pos)
        ways[i][j] = Math.min(ways[i][j], ways[i - 1][j - k] + cost)
      }
      frames.push({ phase: 'cell', cell: [i, j], table: show(), activeLine: L('ways[i][j] = min'), message: `Factory at ${pos} repairs the first ${j} robots for ${ways[i][j]}.` })
    }
  }
  const result = ways[F][m]
  frames.push({ phase: 'done', cell: [F, m], table: show(), activeLine: L('return ways[factories][robots]'), message: `Minimum total distance: ${result}.` })
  return { input: { robot, factory }, result, frames }
}

export const python = `def min_total_distance(robot, factory):
    robots = sorted(robot)
    factories = sorted(factory)
    m = len(robots)
    INF = float('inf')
    ways = [[INF] * (m + 1) for _ in range(len(factories) + 1)]
    ways[0][0] = 0
    for i, (pos, limit) in enumerate(factories, start=1):
        for j in range(m + 1):
            ways[i][j] = ways[i - 1][j]
            cost = 0
            for k in range(1, min(limit, j) + 1):
                cost += abs(robots[j - k] - pos)
                ways[i][j] = min(ways[i][j], ways[i - 1][j - k] + cost)
    return ways[len(factories)][m]
`
